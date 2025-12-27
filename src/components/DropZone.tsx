import { useCallback, useState } from 'react';
import { Upload, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function DropZone({ onFileSelect, isProcessing }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isProcessing) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('audio/')) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, isProcessing]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isProcessing) return;
      
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect, isProcessing]
  );

  return (
    <label
      className={cn(
        'relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group',
        isDragging
          ? 'border-primary bg-primary/10 glow-primary'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        isProcessing && 'pointer-events-none opacity-50'
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isProcessing}
      />

      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div
          className={cn(
            'p-4 rounded-2xl transition-all duration-300',
            isDragging
              ? 'bg-primary text-primary-foreground scale-110'
              : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
          )}
        >
          {isDragging ? (
            <Music2 className="w-10 h-10" />
          ) : (
            <Upload className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            {isDragging ? 'Drop your audio file' : 'Drop audio file here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse • MP3, WAV, FLAC, OGG supported
          </p>
        </div>
      </div>

      {/* Animated border effect */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 animate-pulse-glow bg-primary/5" />
        </div>
      )}
    </label>
  );
}
