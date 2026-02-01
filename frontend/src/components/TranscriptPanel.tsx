import { useRef, useEffect } from 'react';
import { Edit3, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TranscriptPanelProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isEditing: boolean;
  editedText: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function TranscriptPanel({
  transcript,
  interimTranscript,
  isListening,
  isEditing,
  editedText,
  onEditStart,
  onEditCancel,
  onEditChange,
  onSubmit,
  isSubmitting,
}: TranscriptPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayText = isEditing ? editedText : transcript;
  const hasContent = displayText.trim().length > 0 || interimTranscript.length > 0;
  const canSubmit = displayText.trim().length > 0 && !isListening && !isSubmitting;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape' && isEditing) {
      onEditCancel();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="glass rounded-xl p-4 transition-all duration-300">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Transcript
          </span>
          {hasContent && !isListening && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditStart}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </Button>
          )}
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditCancel}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          )}
        </div>

        <div className="relative min-h-[80px]">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
              className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-lg focus-visible:ring-0"
              disabled={isSubmitting}
            />
          ) : (
            <div className={cn(
              'text-lg leading-relaxed',
              !hasContent && 'text-muted-foreground'
            )}>
              {hasContent ? (
                <>
                  <span>{displayText}</span>
                  {interimTranscript && (
                    <span className="text-muted-foreground opacity-70">
                      {displayText ? ' ' : ''}{interimTranscript}
                    </span>
                  )}
                </>
              ) : (
                <span className="flex items-center gap-2">
                  {isListening ? (
                    <>
                      <span>Listening</span>
                      <span className="flex gap-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-typing-dot-1" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-typing-dot-2" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-typing-dot-3" />
                      </span>
                    </>
                  ) : (
                    'Press the microphone button to start speaking'
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {hasContent && !isListening && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
