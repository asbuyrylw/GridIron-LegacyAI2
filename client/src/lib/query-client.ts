import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any
): Promise<Response> {
  console.log(`API Request: ${method} ${endpoint}`, { options: data });

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    console.log(`API Response: ${method} ${endpoint} - Status: ${response.status}`, response);

    if (response.ok) {
      // Only try to parse JSON for successful responses to avoid potential errors
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        console.log(`API Data: ${method} ${endpoint}`, data);
      }
    } else {
      if (response.status === 401) {
        console.log('Authentication error 401, returning null');
      } else {
        const errorText = await response.text();
        console.error(`API Error: ${method} ${endpoint}`, { message: errorText });
      }
    }

    return response;
  } catch (error) {
    console.error(`API Generic Error: ${method} ${endpoint}`, error);
    console.error(`API Request Failed: ${method} ${endpoint}`, error);
    throw error;
  }
}