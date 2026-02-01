// Types for the Voice AI Agent API

export interface QueryRequest {
  input_text: string;
}

export interface QueryResponse {
  answer: string;
  safety_flag: boolean;
  retrieval_time_ms: number;
}

export interface ChatInteraction {
  id: string;
  timestamp: Date;
  transcript: string;
  response: QueryResponse | null;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface VoiceRecorderState {
  isListening: boolean;
  isSupported: boolean;
  hasPermission: boolean | null;
  error: string | null;
}

export type SpeechRecognitionErrorCode = 
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';
