import { AlertCircle, X, Info, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorBannerProps {
  message: string;
  severity?: ErrorSeverity;
  onDismiss?: () => void;
  className?: string;
}

const severityConfig = {
  error: {
    icon: XCircle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
  },
  info: {
    icon: Info,
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
  },
};

export function ErrorBanner({
  message,
  severity = 'error',
  onDismiss,
  className,
}: ErrorBannerProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 animate-fade-in',
        config.bg,
        config.border,
        className
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', config.text)} />
      <span className={cn('flex-1 text-sm', config.text)}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded-full p-1 transition-colors hover:bg-foreground/5',
            config.text
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
