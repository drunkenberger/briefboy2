import { useState, useCallback } from 'react';

export interface ZohoAuthResponse {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

export interface ZohoApiResponse<T = any> {
  data: T[];
  info: {
    count: number;
    page: number;
    per_page: number;
    more_records: boolean;
  };
}

export interface ZohoError {
  code: string;
  details: Record<string, any>;
  message: string;
  status: string;
}

interface UseZohoCRMResult {
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  authenticate: () => Promise<boolean>;
  makeApiCall: <T>(endpoint: string, options?: RequestInit) => Promise<ZohoApiResponse<T>>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useZohoCRM = (): UseZohoCRMResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const clientId = process.env.EXPO_PUBLIC_ZOHO_CLIENT_ID;
  const clientSecret = process.env.EXPO_PUBLIC_ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.EXPO_PUBLIC_ZOHO_REFRESH_TOKEN;
  const baseUrl = process.env.EXPO_PUBLIC_ZOHO_BASE_URL || 'https://www.zohoapis.com';

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!clientId || !clientSecret || !refreshToken) {
      setError('Configuración de Zoho CRM incompleta en variables de entorno');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error de autenticación: ${response.status}`);
      }

      const data: ZohoAuthResponse = await response.json();
      setAccessToken(data.access_token);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al autenticar';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, clientSecret, refreshToken]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    return await refreshAccessToken();
  }, [refreshAccessToken]);

  const makeApiCall = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ZohoApiResponse<T>> => {
    if (!accessToken) {
      const authSuccess = await authenticate();
      if (!authSuccess) {
        throw new Error('No se pudo autenticar con Zoho CRM');
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const authSuccess = await refreshAccessToken();
          if (authSuccess) {
            return makeApiCall(endpoint, options);
          }
        }
        throw new Error(`Error de API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.code && data.code !== 'SUCCESS') {
        throw new Error(data.message || 'Error en la respuesta de Zoho CRM');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido en API';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, authenticate, refreshAccessToken, baseUrl]);

  return {
    isLoading,
    error,
    accessToken,
    authenticate,
    makeApiCall,
    refreshAccessToken,
  };
};