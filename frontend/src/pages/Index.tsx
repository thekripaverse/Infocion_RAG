import { useState, useCallback, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { queryRAG, ApiError } from '@/services/api';
import { ChatInteraction } from '@/types/api';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { ResponseCard } from '@/components/ResponseCard';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ErrorBanner } from '@/components/ErrorBanner';
import UploadPDF from "@/components/UploadPDF";
import UploadImage from '@/components/UploadImage';
const Index = () => {
  // Chat state
  const [interactions, setInteractions] = useState<ChatInteraction[]>([]);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Current interaction state
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Refs
  const mainContentRef = useRef<HTMLDivElement>(null);
  const interactionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Speech recognition hook
  const {
    isListening,
    isSupported,
    hasPermission,
    error: speechError,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    onEnd: () => {
      // Auto-submit when speech recognition ends and we have content
      // This is optional - user can also manually submit
    },
  });

  // Get active interaction
  const activeInteraction = interactions.find(i => i.id === activeInteractionId);
  
  // Handle starting voice recording
  const handleStartRecording = useCallback(() => {
    setGlobalError(null);
    setIsEditing(false);
    setEditedTranscript('');
    resetTranscript();
    startListening();
  }, [resetTranscript, startListening]);

  // Handle stopping voice recording
  const handleStopRecording = useCallback(() => {
    stopListening();
  }, [stopListening]);

  // Handle starting edit mode
  const handleEditStart = useCallback(() => {
    setEditedTranscript(transcript);
    setIsEditing(true);
  }, [transcript]);

  // Handle canceling edit
  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditedTranscript('');
  }, []);

  // Handle submitting the transcript
  const handleSubmit = useCallback(async () => {
    const textToSubmit = isEditing ? editedTranscript.trim() : transcript.trim();
    
    if (!textToSubmit) {
      setGlobalError('Cannot submit empty transcript. Please speak or type something first.');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    // Create new interaction
    const newInteraction: ChatInteraction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      transcript: textToSubmit,
      response: null,
      status: 'loading',
    };

    setInteractions(prev => [newInteraction, ...prev]);
    setActiveInteractionId(newInteraction.id);
    
    // Reset input state
    setIsEditing(false);
    setEditedTranscript('');
    resetTranscript();

    try {
      const response = await queryRAG({ input_text: textToSubmit });
      
      setInteractions(prev =>
        prev.map(i =>
          i.id === newInteraction.id
            ? { ...i, response, status: 'success' }
            : i
        )
      );
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'An unexpected error occurred. Please try again.';

      setInteractions(prev =>
        prev.map(i =>
          i.id === newInteraction.id
            ? { ...i, status: 'error', error: errorMessage }
            : i
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditing, editedTranscript, transcript, resetTranscript]);

  // Handle selecting an interaction from sidebar
  const handleSelectInteraction = useCallback((id: string) => {
    setActiveInteractionId(id);
    
    // Scroll to the interaction
    const element = interactionRefs.current.get(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Handle dismissing errors
  const handleDismissError = useCallback(() => {
    setGlobalError(null);
    clearSpeechError();
  }, [clearSpeechError]);

  // Current display text for transcript panel
  const currentTranscript = isEditing ? '' : transcript;
  const currentInterim = isEditing ? '' : interimTranscript;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <ChatSidebar
        interactions={interactions}
        activeId={activeInteractionId}
        onSelect={handleSelectInteraction}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main 
        ref={mainContentRef}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Voice AI Agent</h1>
              <p className="text-xs text-muted-foreground">Enterprise Knowledge Assistant</p>
            </div>
          </div>
          
          {!isSupported && (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              Speech not supported
            </span>
          )}
        </header>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
          {/* Error Banner */}
          {(speechError || globalError) && (
            <div className="mx-6 mt-4">
              <ErrorBanner
                message={speechError || globalError || ''}
                severity={speechError ? 'warning' : 'error'}
                onDismiss={handleDismissError}
              />
            </div>
          )}

          {/* Voice Input Section */}
          <section className="flex flex-col items-center px-6 py-8">
  
  {/* Mic + Upload Row */}
          <div className="flex items-center gap-8">
            <VoiceRecorder
              isListening={isListening}
              isSupported={isSupported}
              hasPermission={hasPermission}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              disabled={isSubmitting}
            />
            <UploadPDF/>
            <UploadImage />
          </div>

            <div className="mt-8 w-full max-w-2xl">
              <TranscriptPanel
                transcript={currentTranscript}
                interimTranscript={currentInterim}
                isListening={isListening}
                isEditing={isEditing}
                editedText={editedTranscript}
                onEditStart={handleEditStart}
                onEditCancel={handleEditCancel}
                onEditChange={setEditedTranscript}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </section>

          {/* Responses Section */}
          {interactions.length > 0 && (
            <section className="flex flex-col items-center gap-6 px-6 pb-8">
              <div className="w-full max-w-2xl">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Responses
                </h2>
                
                <div className="space-y-6">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      ref={(el) => {
                        if (el) {
                          interactionRefs.current.set(interaction.id, el);
                        }
                      }}
                      className="animate-fade-in"
                    >
                      {/* User Query */}
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <span className="text-xs font-medium">You</span>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-foreground">{interaction.transcript}</p>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {new Intl.DateTimeFormat('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            }).format(interaction.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* AI Response */}
                      <ResponseCard
                        response={interaction.response}
                        isLoading={interaction.status === 'loading'}
                        error={interaction.error}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {interactions.length === 0 && !isListening && (
            <section className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                  <Zap className="h-8 w-8 text-primary/50" />
                </div>
                <h2 className="mb-2 text-lg font-medium text-foreground">
                  Ready to assist
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Click the microphone button above to start speaking. Your voice will be 
                  transcribed in real-time and sent to our enterprise knowledge base.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
