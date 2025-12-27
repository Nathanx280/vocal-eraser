import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveformProps {
  data: number[];
  isPlaying?: boolean;
  progress?: number;
  className?: string;
  color?: 'primary' | 'accent';
}

export function Waveform({ 
  data, 
  isPlaying = false, 
  progress = 0, 
  className,
  color = 'primary' 
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / data.length;
    const gap = 2;

    ctx.clearRect(0, 0, width, height);

    const primaryColor = color === 'primary' ? 'rgb(20, 184, 166)' : 'rgb(168, 85, 247)';
    const dimColor = color === 'primary' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(168, 85, 247, 0.3)';

    data.forEach((value, index) => {
      const barHeight = Math.max(4, value * height * 0.8);
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      const progressPoint = (progress / 100) * data.length;
      const isPast = index < progressPoint;

      ctx.fillStyle = isPast ? primaryColor : dimColor;
      ctx.beginPath();
      ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, 2);
      ctx.fill();
    });
  }, [data, progress, color]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-24', className)}
      style={{ width: '100%', height: '96px' }}
    />
  );
}

export function WaveformPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('w-full h-24 flex items-center justify-center gap-1', className)}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-muted-foreground/20 rounded-full animate-wave"
          style={{
            height: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
