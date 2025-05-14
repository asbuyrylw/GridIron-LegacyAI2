import { QueryClient } from '@tanstack/react-query';

/**
 * The global query client instance.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/**
 * Makes an API request using fetch with improved error handling.
 * Also automatically parses JSON responses.
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Set default headers
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Parse body as JSON if it's an object
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  // Make the request
  const response = await fetch(url, options);

  // Handle non-2xx responses
  if (!response.ok) {
    // Try to parse error JSON if possible
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (e) {
      // If JSON parsing fails, throw generic error
      throw new Error(`API error: ${response.status}`);
    }
  }

  // Return parsed JSON data or null for 204 responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}