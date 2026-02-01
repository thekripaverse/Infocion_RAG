import { QueryRequest, QueryResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function queryRAG(request: QueryRequest): Promise<QueryResponse> {
  const url = `${API_BASE_URL}/query`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ApiError(
        `API request failed: ${errorText}`,
        response.status,
        'API_ERROR'
      );
    }

    const data: QueryResponse = await response.json();
    
    // Validate response shape
    if (typeof data.answer !== 'string') {
      throw new ApiError('Invalid response: missing answer field', undefined, 'INVALID_RESPONSE');
    }
    if (typeof data.safety_flag !== 'boolean') {
      throw new ApiError('Invalid response: missing safety_flag field', undefined, 'INVALID_RESPONSE');
    }
    if (typeof data.retrieval_time_ms !== 'number') {
      throw new ApiError('Invalid response: missing retrieval_time_ms field', undefined, 'INVALID_RESPONSE');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error: Unable to connect to the server', undefined, 'NETWORK_ERROR');
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      undefined,
      'UNKNOWN_ERROR'
    );
  }
}

export { ApiError };
