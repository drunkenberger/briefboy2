import { useState, useCallback } from 'react';
import { useZohoCRM, ZohoApiResponse } from './useZohoCRM';

export interface ZohoContact {
  id: string;
  First_Name: string;
  Last_Name: string;
  Full_Name: string;
  Email: string;
  Phone: string;
  Mobile: string;
  Account_Name: {
    name: string;
    id: string;
  };
  Title: string;
  Department: string;
  Lead_Source: string;
  Contact_Owner: {
    name: string;
    id: string;
    email: string;
  };
  Mailing_Street: string;
  Mailing_City: string;
  Mailing_State: string;
  Mailing_Zip: string;
  Mailing_Country: string;
  Description: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface CreateContactData {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Mobile?: string;
  Account_Name?: string;
  Title?: string;
  Department?: string;
  Lead_Source?: string;
  Mailing_Street?: string;
  Mailing_City?: string;
  Mailing_State?: string;
  Mailing_Zip?: string;
  Mailing_Country?: string;
  Description?: string;
}

interface UseZohoContactsResult {
  contacts: ZohoContact[];
  isLoading: boolean;
  error: string | null;
  getContacts: (page?: number, perPage?: number) => Promise<ZohoContact[]>;
  getContactById: (contactId: string) => Promise<ZohoContact | null>;
  createContact: (contactData: CreateContactData) => Promise<ZohoContact | null>;
  updateContact: (contactId: string, contactData: Partial<CreateContactData>) => Promise<ZohoContact | null>;
  deleteContact: (contactId: string) => Promise<boolean>;
  searchContacts: (searchTerm: string, searchBy?: string) => Promise<ZohoContact[]>;
  getContactsByAccount: (accountId: string) => Promise<ZohoContact[]>;
}

export const useZohoContacts = (): UseZohoContactsResult => {
  const [contacts, setContacts] = useState<ZohoContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { makeApiCall } = useZohoCRM();

  const getContacts = useCallback(async (page: number = 1, perPage: number = 200): Promise<ZohoContact[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoContact> = await makeApiCall(
        `/crm/v6/Contacts?page=${page}&per_page=${perPage}`
      );
      
      const contactsData = response.data || [];
      setContacts(contactsData);
      return contactsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener contactos';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const getContactById = useCallback(async (contactId: string): Promise<ZohoContact | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoContact> = await makeApiCall(`/crm/v6/Contacts/${contactId}`);
      return response.data?.[0] || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener contacto';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const createContact = useCallback(async (contactData: CreateContactData): Promise<ZohoContact | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoContact> = await makeApiCall('/crm/v6/Contacts', {
        method: 'POST',
        body: JSON.stringify({
          data: [contactData]
        }),
      });
      
      const newContact = response.data?.[0];
      if (newContact) {
        setContacts(prevContacts => [newContact, ...prevContacts]);
      }
      return newContact || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear contacto';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const updateContact = useCallback(async (
    contactId: string, 
    contactData: Partial<CreateContactData>
  ): Promise<ZohoContact | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoContact> = await makeApiCall(`/crm/v6/Contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: [contactData]
        }),
      });
      
      const updatedContact = response.data?.[0];
      if (updatedContact) {
        setContacts(prevContacts => 
          prevContacts.map(contact => contact.id === contactId ? updatedContact : contact)
        );
      }
      return updatedContact || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar contacto';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const deleteContact = useCallback(async (contactId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await makeApiCall(`/crm/v6/Contacts/${contactId}`, {
        method: 'DELETE',
      });
      
      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar contacto';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const searchContacts = useCallback(async (
    searchTerm: string, 
    searchBy: string = 'Email'
  ): Promise<ZohoContact[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoContact> = await makeApiCall(
        `/crm/v6/Contacts/search?criteria=(${searchBy}:equals:${encodeURIComponent(searchTerm)})`
      );
      
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar contactos';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  const getContactsByAccount = useCallback(async (accountId: string): Promise<ZohoContact[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ZohoApiResponse<ZohoContact> = await makeApiCall(
        `/crm/v6/Contacts/search?criteria=(Account_Name:equals:${accountId})`
      );
      
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener contactos por cuenta';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [makeApiCall]);

  return {
    contacts,
    isLoading,
    error,
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    searchContacts,
    getContactsByAccount,
  };
};