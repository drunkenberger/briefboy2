import { useState, useCallback } from 'react';
import { useZohoCRM, ZohoApiResponse } from './useZohoCRM';

export interface ZohoLead {
  id: string;
  First_Name: string;
  Last_Name: string;
  Full_Name: string;
  Email: string;
  Phone: string;
  Mobile: string;
  Company: string;
  Lead_Source: string;
  Lead_Status: string;
  Industry: string;
  Annual_Revenue: number;
  Website: string;
  Description: string;
  Rating: string;
  Created_Time: string;
  Modified_Time: string;
  Owner: {
    name: string;
    id: string;
    email: string;
  };
}

export interface CreateLeadData {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Mobile?: string;
  Company: string;
  Lead_Source?: string;
  Lead_Status?: string;
  Industry?: string;
  Annual_Revenue?: number;
  Website?: string;
  Description?: string;
  Rating?: string;
}

interface UseZohoLeadsResult {
  leads: ZohoLead[];
  isLoading: boolean;
  error: string | null;
  getLeads: (page?: number, perPage?: number) => Promise<ZohoLead[]>;
  getLeadById: (leadId: string) => Promise<ZohoLead | null>;
  createLead: (leadData: CreateLeadData) => Promise<ZohoLead | null>;
  updateLead: (leadId: string, leadData: Partial<CreateLeadData>) => Promise<ZohoLead | null>;
  deleteLead: (leadId: string) => Promise<boolean>;
  searchLeads: (searchTerm: string, searchBy?: string) => Promise<ZohoLead[]>;
  convertLead: (leadId: string, contactData?: any, accountData?: any, dealData?: any) => Promise<boolean>;
}

export const useZohoLeads = (): UseZohoLeadsResult => {
  const [leads, setLeads] = useState<ZohoLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { makeApiCall } = useZohoCRM();

  const getLeads = useCallback(async (page: number = 1, perPage: number = 200): Promise<ZohoLead[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoLead> = await makeApiCall(
        `/crm/v6/Leads?page=${page}&per_page=${perPage}`
      );
      
      const leadsData = response.data || [];
      setLeads(leadsData);
      return leadsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener leads';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const getLeadById = useCallback(async (leadId: string): Promise<ZohoLead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoLead> = await makeApiCall(`/crm/v6/Leads/${leadId}`);
      return response.data?.[0] || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener lead';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const createLead = useCallback(async (leadData: CreateLeadData): Promise<ZohoLead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoLead> = await makeApiCall('/crm/v6/Leads', {
        method: 'POST',
        body: JSON.stringify({
          data: [leadData]
        }),
      });
      
      const newLead = response.data?.[0];
      if (newLead) {
        setLeads(prevLeads => [newLead, ...prevLeads]);
      }
      return newLead || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear lead';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const updateLead = useCallback(async (
    leadId: string, 
    leadData: Partial<CreateLeadData>
  ): Promise<ZohoLead | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoLead> = await makeApiCall(`/crm/v6/Leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: [leadData]
        }),
      });
      
      const updatedLead = response.data?.[0];
      if (updatedLead) {
        setLeads(prevLeads => 
          prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)
        );
      }
      return updatedLead || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar lead';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const deleteLead = useCallback(async (leadId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await makeApiCall(`/crm/v6/Leads/${leadId}`, {
        method: 'DELETE',
      });
      
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar lead';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const searchLeads = useCallback(async (
    searchTerm: string, 
    searchBy: string = 'Email'
  ): Promise<ZohoLead[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoLead> = await makeApiCall(
        `/crm/v6/Leads/search?criteria=(${searchBy}:equals:${encodeURIComponent(searchTerm)})`
      );
      
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar leads';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const convertLead = useCallback(async (
    leadId: string,
    contactData?: any,
    accountData?: any,
    dealData?: any
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const convertData: any = {};
      
      if (contactData) convertData.Contacts = contactData;
      if (accountData) convertData.Accounts = accountData;
      if (dealData) convertData.Deals = dealData;

      await makeApiCall(`/crm/v6/Leads/${leadId}/actions/convert`, {
        method: 'POST',
        body: JSON.stringify({
          data: [convertData]
        }),
      });
      
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al convertir lead';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  return {
    leads,
    isLoading,
    error,
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    searchLeads,
    convertLead,
  };
};