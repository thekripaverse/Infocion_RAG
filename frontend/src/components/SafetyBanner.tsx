import { AlertTriangle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SafetyBannerProps {
  visible: boolean;
}

export function SafetyBanner({ visible }: SafetyBannerProps) {
  if (!visible) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 animate-fade-in">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
      <span className="flex-1 text-sm font-medium text-destructive">
        Response modified by AI safety system
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex-shrink-0 rounded-full p-1 text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Learn more about safety guardrails"
          >
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="max-w-[280px] bg-popover border-border text-popover-foreground"
        >
          <p className="text-sm">
            This response was modified by our AI safety system to prevent potentially harmful, 
            misleading, or inappropriate content from being generated.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
