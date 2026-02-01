import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  hasPermission: boolean | null;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({
  isListening,
  isSupported,
  hasPermission,
  onStart,
  onStop,
  disabled = false,
}: VoiceRecorderProps) {
  const canRecord = isSupported && hasPermission !== false && !disabled;

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Pulse rings when recording */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse-ring" />
            <div className="absolute inset-0 rounded-full bg-destructive/10 animate-pulse-ring [animation-delay:0.5s]" />
          </>
        )}
        
        <button
          onClick={handleClick}
          disabled={!canRecord}
          className={cn(
            'relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
            isListening
              ? 'bg-destructive text-destructive-foreground glow-recording focus:ring-destructive'
              : canRecord
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 glow-primary focus:ring-primary'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? (
            <Square className="h-8 w-8 fill-current" />
          ) : hasPermission === false ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      <div className="text-center">
        <p className={cn(
          'text-sm font-medium transition-colors',
          isListening ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {isListening ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              Listening...
            </span>
          ) : !isSupported ? (
            'Not supported'
          ) : hasPermission === false ? (
            'Microphone blocked'
          ) : (
            'Click to speak'
          )}
        </p>
      </div>
    </div>
  );
}
