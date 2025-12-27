import { Loader2, CheckCircle2, Waves } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { ProcessingProgress } from '@/lib/audioProcessor';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  progress: ProcessingProgress;
}

export function ProcessingStatus({ progress }: ProcessingStatusProps) {
  const isComplete = progress.stage === 'complete';

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'p-3 rounded-xl transition-all duration-300',
            isComplete ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              {progress.message}
            </span>
            <span className="text-sm font-mono text-primary">
              {progress.progress}%
            </span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>
      </div>

      {/* Processing stages indicator */}
      <div className="flex justify-between px-2">
        {['loading', 'analyzing', 'processing', 'finalizing', 'complete'].map((stage, index) => {
          const stages = ['loading', 'analyzing', 'processing', 'finalizing', 'complete'];
          const currentIndex = stages.indexOf(progress.stage);
          const isActive = index <= currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  isActive ? 'bg-primary glow-primary' : 'bg-muted'
                )}
              />
              <span
                className={cn(
                  'text-xs capitalize transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-muted-foreground/50'
                )}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProcessingAnimation() {
  return (
    <div className="flex items-center justify-center gap-1 py-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-wave"
          style={{
            height: `${20 + Math.sin(i * 0.5) * 30}px`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
