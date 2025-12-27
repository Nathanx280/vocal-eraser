import { useState, useRef, useCallback } from 'react';
import { Music2, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropZone } from './DropZone';
import { Waveform, WaveformPlaceholder } from './Waveform';
import { ProcessingStatus, ProcessingAnimation } from './ProcessingStatus';
import { AudioTrack } from './AudioTrack';
import { 
  loadAudioFile, 
  removeVocals, 
  getWaveformData,
  type ProcessingProgress,
  type ProcessedAudio 
} from '@/lib/audioProcessor';
import { useToast } from '@/hooks/use-toast';

export function VocalRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [processedAudio, setProcessedAudio] = useState<ProcessedAudio | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setProcessedAudio(null);
    setProgress(null);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const buffer = await loadAudioFile(selectedFile, audioContextRef.current);
      setOriginalBuffer(buffer);
      
      const data = getWaveformData(buffer);
      setWaveformData(data);

      toast({
        title: 'Audio loaded',
        description: `${selectedFile.name} is ready for processing`,
      });
    } catch (error) {
      toast({
        title: 'Error loading audio',
        description: 'Could not load the audio file. Please try another format.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleProcess = useCallback(async () => {
    if (!originalBuffer) return;

    setIsProcessing(true);
    setProgress({ stage: 'loading', progress: 0, message: 'Starting processing...' });

    try {
      const result = await removeVocals(originalBuffer, setProgress);
      setProcessedAudio(result);
      
      toast({
        title: 'Processing complete!',
        description: 'Your audio has been separated into vocals and instrumental.',
      });
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'An error occurred while processing the audio.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [originalBuffer, toast]);

  const handleClear = useCallback(() => {
    setFile(null);
    setOriginalBuffer(null);
    setWaveformData([]);
    setProcessedAudio(null);
    setProgress(null);
  }, []);

  const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'audio';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Section */}
      {!file ? (
        <DropZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      ) : (
        <div className="glass rounded-2xl p-6 space-y-6">
          {/* File info header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20 text-primary">
                <Music2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground truncate max-w-md">
                  {file.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                  {originalBuffer && ` • ${Math.floor(originalBuffer.duration)}s`}
                  {originalBuffer && ` • ${originalBuffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={isProcessing}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Original waveform */}
          {waveformData.length > 0 ? (
            <Waveform data={waveformData} />
          ) : (
            <WaveformPlaceholder />
          )}

          {/* Processing status or button */}
          {isProcessing && progress ? (
            <>
              <ProcessingAnimation />
              <ProcessingStatus progress={progress} />
            </>
          ) : !processedAudio ? (
            <Button
              onClick={handleProcess}
              disabled={!originalBuffer || isProcessing}
              className="w-full h-14 text-lg gap-3 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Remove Vocals
            </Button>
          ) : null}
        </div>
      )}

      {/* Results Section */}
      {processedAudio && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Separated Tracks
          </h2>
          
          <div className="grid gap-6">
            <AudioTrack
              title="🎵 Instrumental (Vocals Removed)"
              audioBuffer={processedAudio.instrumental}
              color="primary"
              filename={`${baseName}_instrumental.wav`}
            />
            
            <AudioTrack
              title="🎤 Vocals (Isolated)"
              audioBuffer={processedAudio.vocals}
              color="accent"
              filename={`${baseName}_vocals.wav`}
            />
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleClear}
              className="gap-2"
            >
              Process Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
