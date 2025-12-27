// Audio processing utilities for vocal removal
// Uses phase cancellation technique for vocal isolation

export interface ProcessedAudio {
  instrumental: AudioBuffer;
  vocals: AudioBuffer;
}

export interface ProcessingProgress {
  stage: 'loading' | 'analyzing' | 'processing' | 'finalizing' | 'complete';
  progress: number;
  message: string;
}

export async function loadAudioFile(
  file: File,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

// Phase cancellation vocal removal technique
// Works best with stereo files where vocals are centered
export async function removeVocals(
  audioBuffer: AudioBuffer,
  onProgress: (progress: ProcessingProgress) => void
): Promise<ProcessedAudio> {
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const numberOfChannels = audioBuffer.numberOfChannels;

  onProgress({ stage: 'analyzing', progress: 10, message: 'Analyzing audio channels...' });

  // Create offline context for processing
  const offlineContext = new OfflineAudioContext(2, length, sampleRate);

  // For stereo files, use phase cancellation
  if (numberOfChannels >= 2) {
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);

    // Create instrumental (vocals removed) buffer
    const instrumentalBuffer = offlineContext.createBuffer(2, length, sampleRate);
    const instrumentalLeft = instrumentalBuffer.getChannelData(0);
    const instrumentalRight = instrumentalBuffer.getChannelData(1);

    // Create vocals buffer
    const vocalsBuffer = offlineContext.createBuffer(2, length, sampleRate);
    const vocalsLeft = vocalsBuffer.getChannelData(0);
    const vocalsRight = vocalsBuffer.getChannelData(1);

    onProgress({ stage: 'processing', progress: 30, message: 'Separating vocals using phase cancellation...' });

    // Process in chunks for progress updates
    const chunkSize = Math.floor(length / 10);
    
    for (let i = 0; i < length; i++) {
      // Phase cancellation: subtract channels to remove center-panned vocals
      const diff = (leftChannel[i] - rightChannel[i]) * 0.7;
      const sum = (leftChannel[i] + rightChannel[i]) * 0.5;

      // Instrumental: difference between channels (removes center)
      instrumentalLeft[i] = diff;
      instrumentalRight[i] = -diff;

      // Vocals: sum of channels minus difference (isolates center)
      vocalsLeft[i] = sum - diff * 0.3;
      vocalsRight[i] = sum + diff * 0.3;

      // Update progress
      if (i % chunkSize === 0) {
        const progressPercent = 30 + Math.floor((i / length) * 50);
        onProgress({ 
          stage: 'processing', 
          progress: progressPercent, 
          message: `Processing audio... ${Math.floor((i / length) * 100)}%` 
        });
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    onProgress({ stage: 'finalizing', progress: 85, message: 'Normalizing audio levels...' });

    // Normalize the outputs
    normalizeBuffer(instrumentalBuffer);
    normalizeBuffer(vocalsBuffer);

    onProgress({ stage: 'complete', progress: 100, message: 'Processing complete!' });

    return {
      instrumental: instrumentalBuffer,
      vocals: vocalsBuffer,
    };
  } else {
    // For mono files, we can't do true vocal separation
    // Return the original as both (limited functionality)
    onProgress({ stage: 'processing', progress: 50, message: 'Mono audio detected - limited separation possible...' });
    
    const monoBuffer = offlineContext.createBuffer(1, length, sampleRate);
    monoBuffer.getChannelData(0).set(audioBuffer.getChannelData(0));

    onProgress({ stage: 'complete', progress: 100, message: 'Processing complete!' });

    return {
      instrumental: monoBuffer,
      vocals: monoBuffer,
    };
  }
}

function normalizeBuffer(buffer: AudioBuffer): void {
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    let max = 0;
    
    // Find max amplitude
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > max) max = abs;
    }

    // Normalize if needed
    if (max > 0 && max < 1) {
      const gain = 0.95 / max;
      for (let i = 0; i < data.length; i++) {
        data[i] *= gain;
      }
    }
  }
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels and write samples
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function getWaveformData(audioBuffer: AudioBuffer, samples: number = 200): number[] {
  const rawData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(rawData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[start + j]);
    }
    waveform.push(sum / blockSize);
  }

  // Normalize to 0-1 range
  const max = Math.max(...waveform);
  return waveform.map(v => v / max);
}
