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
  method: string,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  console.log(`API Request: ${method} ${url}`, { options });
  
  // Set method
  options.method = method;
  
  // Set default headers
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Ensure credentials are included to send cookies
  options.credentials = 'include';

  // Parse body as JSON if it's an object
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  try {
    // Make the request
    const response = await fetch(url, options);
    
    console.log(`API Response: ${method} ${url} - Status: ${response.status}`, {
      headers: Object.fromEntries([...response.headers.entries()]),
      status: response.status,
      statusText: response.statusText,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      // Try to parse error JSON if possible
      try {
        const errorData = await response.json();
        console.error(`API Error: ${method} ${url}`, errorData);
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (e) {
        // If JSON parsing fails, throw generic error
        console.error(`API Generic Error: ${method} ${url}`, e);
        throw new Error(`API error: ${response.status}`);
      }
    }

    // Return parsed JSON data or null for 204 responses
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    console.log(`API Data: ${method} ${url}`, data);
    return data;
  } catch (error) {
    console.error(`API Request Failed: ${method} ${url}`, error);
    throw error;
  }
}