import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceRecorderState, SpeechRecognitionErrorCode } from '@/types/api';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: SpeechRecognitionErrorCode;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionOptions {
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  language?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onTranscriptChange, onEnd, language = 'en-US' } = options;
  
  const [state, setState] = useState<VoiceRecorderState>({
    isListening: false,
    isSupported: false,
    hasPermission: null,
    error: null,
  });
  
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognitionAPI,
      error: SpeechRecognitionAPI ? null : 'Speech recognition is not supported in this browser',
    }));
  }, []);

  const getErrorMessage = (errorCode: SpeechRecognitionErrorCode): string => {
    const errorMessages: Record<SpeechRecognitionErrorCode, string> = {
      'no-speech': 'No speech was detected. Please try again.',
      'aborted': 'Speech recognition was aborted.',
      'audio-capture': 'No microphone was found or microphone is not working.',
      'network': 'Network error occurred. Please check your connection.',
      'not-allowed': 'Microphone permission was denied. Please allow microphone access.',
      'service-not-allowed': 'Speech recognition service is not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'language-not-supported': 'Language is not supported.',
    };
    return errorMessages[errorCode] || 'An unknown error occurred.';
  };

  const startListening = useCallback(async () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition is not supported in this browser',
      }));
      return;
    }

    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setState(prev => ({ ...prev, hasPermission: true }));
    } catch {
      setState(prev => ({
        ...prev,
        hasPermission: false,
        error: 'Microphone permission denied. Please allow microphone access in your browser settings.',
      }));
      return;
    }

    // Create new recognition instance
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
      finalTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          final += transcriptText + ' ';
          finalTranscriptRef.current = final;
        } else {
          interim += transcriptText;
        }
      }

      setTranscript(final.trim());
      setInterimTranscript(interim);
      
      onTranscriptChange?.(final.trim() + (interim ? ' ' + interim : ''), !interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error);
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false,
        hasPermission: event.error === 'not-allowed' ? false : prev.hasPermission,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      onEnd?.();
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition',
        isListening: false,
      }));
    }
  }, [language, onTranscriptChange, onEnd]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : ''),
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  };
}
