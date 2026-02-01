import { cn } from '@/lib/utils';

interface LoaderProps {
  text?: string;
  className?: string;
}

export function Loader({ text = 'Loading...', className }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Animated spinner */}
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      
      {/* Text with shimmer effect */}
      <div className="relative overflow-hidden">
        <span className="text-sm text-muted-foreground">{text}</span>
        <div className="absolute inset-0 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer opacity-30" />
      </div>
    </div>
  );
}

export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-5 w-5">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    </div>
  );
}
