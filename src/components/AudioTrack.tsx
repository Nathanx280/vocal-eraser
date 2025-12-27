import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Waveform } from './Waveform';
import { cn } from '@/lib/utils';
import { getWaveformData, audioBufferToWav } from '@/lib/audioProcessor';

interface AudioTrackProps {
  title: string;
  audioBuffer: AudioBuffer;
  color?: 'primary' | 'accent';
  filename: string;
}

export function AudioTrack({ title, audioBuffer, color = 'primary', filename }: AudioTrackProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const data = getWaveformData(audioBuffer);
    setWaveformData(data);
  }, [audioBuffer]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
    };
  }, []);

  const updateProgress = () => {
    if (!audioContextRef.current || !isPlaying) return;
    
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseTimeRef.current;
    const duration = audioBuffer.duration;
    const newProgress = Math.min((elapsed / duration) * 100, 100);
    
    setProgress(newProgress);
    
    if (newProgress >= 100) {
      setIsPlaying(false);
      setProgress(0);
      pauseTimeRef.current = 0;
    } else {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      if (sourceRef.current) {
        sourceRef.current.stop();
        pauseTimeRef.current += audioContextRef.current!.currentTime - startTimeRef.current;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsPlaying(false);
    } else {
      // Play
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      gainNode.gain.value = isMuted ? 0 : volume / 100;
      
      sourceRef.current = source;
      gainNodeRef.current = gainNode;
      
      const offset = (pauseTimeRef.current / audioBuffer.duration) * audioBuffer.duration;
      source.start(0, offset);
      startTimeRef.current = audioContextRef.current.currentTime;
      
      source.onended = () => {
        if (isPlaying) {
          setIsPlaying(false);
          setProgress(0);
          pauseTimeRef.current = 0;
        }
      };
      
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(false);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume / 100;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMuted ? 0 : volume / 100;
    }
  };

  const handleDownload = () => {
    const blob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * audioBuffer.duration;

  return (
    <div className={cn(
      'glass rounded-2xl p-6 space-y-4 transition-all duration-300',
      color === 'primary' ? 'hover:border-primary/50' : 'hover:border-accent/50'
    )}>
      <div className="flex items-center justify-between">
        <h3 className={cn(
          'text-lg font-semibold',
          color === 'primary' ? 'text-primary' : 'text-accent'
        )}>
          {title}
        </h3>
        <span className="text-sm text-muted-foreground font-mono">
          {formatTime(currentTime)} / {formatTime(audioBuffer.duration)}
        </span>
      </div>

      <Waveform data={waveformData} isPlaying={isPlaying} progress={progress} color={color} />

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className={cn(
            'h-12 w-12 rounded-full border-2 transition-all duration-300',
            color === 'primary' 
              ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' 
              : 'border-accent text-accent hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>

        <Button
          onClick={handleDownload}
          className={cn(
            'gap-2 transition-all duration-300',
            color === 'primary' 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-accent text-accent-foreground hover:bg-accent/90'
          )}
        >
          <Download className="h-4 w-4" />
          Download WAV
        </Button>
      </div>
    </div>
  );
}
