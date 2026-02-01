import { Bot, Clock } from 'lucide-react';
import { SafetyBanner } from './SafetyBanner';
import { QueryResponse } from '@/types/api';
import { cn } from '@/lib/utils';

interface ResponseCardProps {
  response: QueryResponse | null;
  isLoading: boolean;
  error?: string | null;
}

export function ResponseCard({ response, isLoading, error }: ResponseCardProps) {
  if (!isLoading && !response && !error) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      <div className="glass rounded-xl p-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            'bg-primary/10 text-primary'
          )}>
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            {response && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Retrieved and reasoned in {response.retrieval_time_ms}ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Safety Banner */}
        {response?.safety_flag && (
          <SafetyBanner visible={true} />
        )}

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {isLoading && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="relative h-5 w-5">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <span className="text-sm">Searching enterprise knowledge base…</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {response && !isLoading && (
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {response.answer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
