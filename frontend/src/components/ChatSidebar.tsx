import { MessageSquare, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatInteraction } from '@/types/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSidebarProps {
  interactions: ChatInteraction[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  interactions,
  activeId,
  onSelect,
  isCollapsed,
  onToggle,
}: ChatSidebarProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '…';
  };

  return (
    <div
      className={cn(
        'relative h-full border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-14' : 'w-80'
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar hover:bg-sidebar-accent"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      <div className={cn(
        'flex h-14 items-center border-b border-sidebar-border px-4',
        isCollapsed && 'justify-center px-2'
      )}>
        {isCollapsed ? (
          <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
        ) : (
          <h2 className="text-sm font-semibold text-sidebar-foreground">
            Chat History
          </h2>
        )}
      </div>

      {/* Interactions List */}
      <ScrollArea className="h-[calc(100%-3.5rem)]">
        <div className="p-2">
          {interactions.length === 0 ? (
            <div className={cn(
              'flex flex-col items-center justify-center py-8 text-center text-muted-foreground',
              isCollapsed && 'py-4'
            )}>
              {isCollapsed ? (
                <MessageSquare className="h-5 w-5 opacity-50" />
              ) : (
                <>
                  <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-xs">No interactions yet</p>
                  <p className="text-xs opacity-70">Start speaking to begin</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {interactions.map((interaction, index) => (
                <button
                  key={interaction.id}
                  onClick={() => onSelect(interaction.id)}
                  className={cn(
                    'group w-full rounded-lg p-3 text-left transition-all duration-200',
                    'hover:bg-sidebar-accent',
                    activeId === interaction.id && 'bg-sidebar-accent',
                    isCollapsed && 'flex items-center justify-center p-2'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {isCollapsed ? (
                    <div className="relative">
                      <MessageSquare className={cn(
                        'h-5 w-5',
                        activeId === interaction.id
                          ? 'text-sidebar-primary'
                          : 'text-sidebar-foreground'
                      )} />
                      {interaction.response?.safety_flag && (
                        <Shield className="absolute -right-1 -top-1 h-3 w-3 text-destructive" />
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(interaction.timestamp)}
                        </span>
                        {interaction.response?.safety_flag && (
                          <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                            <Shield className="h-2.5 w-2.5" />
                            Safety
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        'text-sm leading-snug',
                        activeId === interaction.id
                          ? 'text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground'
                      )}>
                        {truncateText(interaction.transcript, 60)}
                      </p>
                      {interaction.response && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {truncateText(interaction.response.answer, 80)}
                        </p>
                      )}
                      {interaction.status === 'loading' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          Loading…
                        </div>
                      )}
                      {interaction.status === 'error' && (
                        <p className="mt-1 text-xs text-destructive">
                          Error occurred
                        </p>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
