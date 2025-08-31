import { getServiceConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';

export interface CRMContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  website?: string;
  source?: string;
  tags?: string[];
  properties?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMDeal {
  id: string;
  name: string;
  contactId: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  source?: string;
  properties?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  revenue?: number;
  properties?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  body?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMPipeline {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
    probability: number;
    order: number;
  }[];
}

interface HubSpotAPI {
  baseUrl: string;
  accessToken: string;
}

interface SalesforceAPI {
  instanceUrl: string;
  accessToken: string;
  refreshToken?: string;
}

class CRMService {
  private config: ReturnType<typeof getServiceConfig>['crm'];
  private hubspotAPI?: HubSpotAPI;
  private salesforceAPI?: SalesforceAPI;

  constructor() {
    this.config = getServiceConfig().crm;
    
    // Initialize HubSpot if configured
    if (this.config.hubspot.enabled && this.config.hubspot.accessToken) {
      this.hubspotAPI = {
        baseUrl: 'https://api.hubapi.com',
        accessToken: this.config.hubspot.accessToken,
      };
    }
    
    // Initialize Salesforce if configured
    if (this.config.salesforce.enabled && this.config.salesforce.clientId) {
      // Note: Salesforce requires OAuth flow for access token
      // This is a placeholder - you'd need to implement the OAuth flow
    }
  }

  // Contact Management
  async createContact(contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMContact> {
    if (this.hubspotAPI) {
      return await this.createHubSpotContact(contact);
    } else if (this.salesforceAPI) {
      return await this.createSalesforceContact(contact);
    } else {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'createContact',
        message: 'No CRM provider configured',
        retryable: false,
      });
    }
  }

  private async createHubSpotContact(contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMContact> {
    if (!this.hubspotAPI) throw new Error('HubSpot not configured');
    
    try {
      const response = await fetch(`${this.hubspotAPI.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hubspotAPI.accessToken}`,
        },
        body: JSON.stringify({
          properties: {
            email: contact.email,
            firstname: contact.firstName,
            lastname: contact.lastName,
            company: contact.company,
            phone: contact.phone,
            website: contact.website,
            hs_lead_status: 'NEW',
            ...contact.properties,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        company: contact.company,
        phone: contact.phone,
        website: contact.website,
        source: contact.source,
        tags: contact.tags,
        properties: result.properties,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'createHubSpotContact',
        message: `Failed to create HubSpot contact: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { email: contact.email },
      });
    }
  }

  private async createSalesforceContact(contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMContact> {
    if (!this.salesforceAPI) throw new Error('Salesforce not configured');
    
    try {
      const response = await fetch(`${this.salesforceAPI.instanceUrl}/services/data/v58.0/sobjects/Contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.salesforceAPI.accessToken}`,
        },
        body: JSON.stringify({
          Email: contact.email,
          FirstName: contact.firstName,
          LastName: contact.lastName,
          Account: { Name: contact.company },
          Phone: contact.phone,
          LeadSource: contact.source,
        }),
      });

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        company: contact.company,
        phone: contact.phone,
        website: contact.website,
        source: contact.source,
        tags: contact.tags,
        properties: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'createSalesforceContact',
        message: `Failed to create Salesforce contact: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { email: contact.email },
      });
    }
  }

  async getContact(id: string): Promise<CRMContact | null> {
    if (this.hubspotAPI) {
      return await this.getHubSpotContact(id);
    } else if (this.salesforceAPI) {
      return await this.getSalesforceContact(id);
    } else {
      return null;
    }
  }

  private async getHubSpotContact(id: string): Promise<CRMContact | null> {
    if (!this.hubspotAPI) return null;
    
    try {
      const response = await fetch(`${this.hubspotAPI.baseUrl}/crm/v3/objects/contacts/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.hubspotAPI.accessToken}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        email: result.properties.email,
        firstName: result.properties.firstname,
        lastName: result.properties.lastname,
        company: result.properties.company,
        phone: result.properties.phone,
        website: result.properties.website,
        properties: result.properties,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'getHubSpotContact',
        message: `Failed to get HubSpot contact: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { contactId: id },
      });
    }
  }

  private async getSalesforceContact(id: string): Promise<CRMContact | null> {
    if (!this.salesforceAPI) return null;
    
    try {
      const response = await fetch(`${this.salesforceAPI.instanceUrl}/services/data/v58.0/sobjects/Contact/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.salesforceAPI.accessToken}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return {
        id: result.Id,
        email: result.Email,
        firstName: result.FirstName,
        lastName: result.LastName,
        phone: result.Phone,
        properties: result,
        createdAt: new Date(result.CreatedDate),
        updatedAt: new Date(result.LastModifiedDate),
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'getSalesforceContact',
        message: `Failed to get Salesforce contact: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { contactId: id },
      });
    }
  }

  async updateContact(id: string, updates: Partial<Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CRMContact> {
    if (this.hubspotAPI) {
      return await this.updateHubSpotContact(id, updates);
    } else if (this.salesforceAPI) {
      return await this.updateSalesforceContact(id, updates);
    } else {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'updateContact',
        message: 'No CRM provider configured',
        retryable: false,
      });
    }
  }

  private async updateHubSpotContact(id: string, updates: Partial<Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CRMContact> {
    if (!this.hubspotAPI) throw new Error('HubSpot not configured');
    
    try {
      const response = await fetch(`${this.hubspotAPI.baseUrl}/crm/v3/objects/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hubspotAPI.accessToken}`,
        },
        body: JSON.stringify({
          properties: {
            email: updates.email,
            firstname: updates.firstName,
            lastname: updates.lastName,
            company: updates.company,
            phone: updates.phone,
            website: updates.website,
            ...updates.properties,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        email: result.properties.email,
        firstName: result.properties.firstname,
        lastName: result.properties.lastname,
        company: result.properties.company,
        phone: result.properties.phone,
        website: result.properties.website,
        properties: result.properties,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'updateHubSpotContact',
        message: `Failed to update HubSpot contact: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { contactId: id },
      });
    }
  }

  private async updateSalesforceContact(id: string, updates: Partial<Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CRMContact> {
    if (!this.salesforceAPI) throw new Error('Salesforce not configured');
    
    try {
      const response = await fetch(`${this.salesforceAPI.instanceUrl}/services/data/v58.0/sobjects/Contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.salesforceAPI.accessToken}`,
        },
        body: JSON.stringify({
          Email: updates.email,
          FirstName: updates.firstName,
          LastName: updates.lastName,
          Phone: updates.phone,
        }),
      });

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status} ${await response.text()}`);
      }

      // Return updated contact
      return await this.getSalesforceContact(id) as CRMContact;
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'updateSalesforceContact',
        message: `Failed to update Salesforce contact: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { contactId: id },
      });
    }
  }

  async searchContacts(query: {
    email?: string;
    company?: string;
    name?: string;
    limit?: number;
  }): Promise<CRMContact[]> {
    if (this.hubspotAPI) {
      return await this.searchHubSpotContacts(query);
    } else if (this.salesforceAPI) {
      return await this.searchSalesforceContacts(query);
    } else {
      return [];
    }
  }

  private async searchHubSpotContacts(query: {
    email?: string;
    company?: string;
    name?: string;
    limit?: number;
  }): Promise<CRMContact[]> {
    if (!this.hubspotAPI) return [];
    
    try {
      const searchFilters = [];
      
      if (query.email) {
        searchFilters.push({
          propertyName: 'email',
          operator: 'EQ',
          value: query.email,
        });
      }
      
      if (query.company) {
        searchFilters.push({
          propertyName: 'company',
          operator: 'CONTAINS_TOKEN',
          value: query.company,
        });
      }
      
      if (query.name) {
        searchFilters.push({
          propertyName: 'firstname',
          operator: 'CONTAINS_TOKEN',
          value: query.name,
        });
      }

      const response = await fetch(`${this.hubspotAPI.baseUrl}/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hubspotAPI.accessToken}`,
        },
        body: JSON.stringify({
          filterGroups: [{ filters: searchFilters }],
          limit: query.limit || 10,
          properties: ['email', 'firstname', 'lastname', 'company', 'phone', 'website'],
        }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return result.results.map((contact: any) => ({
        id: contact.id,
        email: contact.properties.email,
        firstName: contact.properties.firstname,
        lastName: contact.properties.lastname,
        company: contact.properties.company,
        phone: contact.properties.phone,
        website: contact.properties.website,
        properties: contact.properties,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt),
      }));
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'searchHubSpotContacts',
        message: `Failed to search HubSpot contacts: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { query },
      });
    }
  }

  private async searchSalesforceContacts(query: {
    email?: string;
    company?: string;
    name?: string;
    limit?: number;
  }): Promise<CRMContact[]> {
    if (!this.salesforceAPI) return [];
    
    try {
      const conditions = [];
      
      if (query.email) {
        conditions.push(`Email = '${query.email}'`);
      }
      
      if (query.name) {
        conditions.push(`(FirstName LIKE '%${query.name}%' OR LastName LIKE '%${query.name}%')`);
      }

      const soql = `SELECT Id, Email, FirstName, LastName, Phone, CreatedDate, LastModifiedDate FROM Contact${conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''} LIMIT ${query.limit || 10}`;
      
      const response = await fetch(`${this.salesforceAPI.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`, {
        headers: {
          'Authorization': `Bearer ${this.salesforceAPI.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      
      return result.records.map((contact: any) => ({
        id: contact.Id,
        email: contact.Email,
        firstName: contact.FirstName,
        lastName: contact.LastName,
        phone: contact.Phone,
        properties: contact,
        createdAt: new Date(contact.CreatedDate),
        updatedAt: new Date(contact.LastModifiedDate),
      }));
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.CRM,
        service: 'crm',
        operation: 'searchSalesforceContacts',
        message: `Failed to search Salesforce contacts: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { query },
      });
    }
  }

  // Deal Management
  async createDeal(deal: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMDeal> {
    // Implementation similar to contacts but for deals
    throw new Error('Deal management not yet implemented');
  }

  // Activity tracking
  async createActivity(activity: Omit<CRMActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMActivity> {
    // Implementation for logging activities
    throw new Error('Activity tracking not yet implemented');
  }

  // Pipeline management
  async getPipelines(): Promise<CRMPipeline[]> {
    // Implementation for getting sales pipelines
    throw new Error('Pipeline management not yet implemented');
  }

  // Health check
  async healthCheck(): Promise<{ hubspot?: boolean; salesforce?: boolean }> {
    const results: { hubspot?: boolean; salesforce?: boolean } = {};
    
    if (this.hubspotAPI) {
      try {
        const response = await fetch(`${this.hubspotAPI.baseUrl}/crm/v3/objects/contacts?limit=1`, {
          headers: {
            'Authorization': `Bearer ${this.hubspotAPI.accessToken}`,
          },
        });
        results.hubspot = response.ok;
      } catch (error) {
        results.hubspot = false;
      }
    }
    
    if (this.salesforceAPI) {
      try {
        const response = await fetch(`${this.salesforceAPI.instanceUrl}/services/data/v58.0/sobjects/Contact/?limit=1`, {
          headers: {
            'Authorization': `Bearer ${this.salesforceAPI.accessToken}`,
          },
        });
        results.salesforce = response.ok;
      } catch (error) {
        results.salesforce = false;
      }
    }
    
    return results;
  }

  // Sync contact from form submission
  async syncContactFromForm(formData: {
    name?: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
    source?: string;
  }): Promise<CRMContact> {
    const [firstName, ...lastNameParts] = (formData.name || '').split(' ');
    const lastName = lastNameParts.join(' ');
    
    // Check if contact already exists
    const existingContacts = await this.searchContacts({ email: formData.email });
    
    if (existingContacts.length > 0) {
      // Update existing contact
      const existingContact = existingContacts[0];
      return await this.updateContact(existingContact.id, {
        company: formData.company || existingContact.company,
        phone: formData.phone || existingContact.phone,
        source: formData.source || existingContact.source,
      });
    } else {
      // Create new contact
      return await this.createContact({
        email: formData.email,
        firstName,
        lastName,
        company: formData.company,
        phone: formData.phone,
        source: formData.source || 'website_form',
        properties: {
          initial_message: formData.message,
        },
      });
    }
  }
}

// Create wrapped methods with error handling and retry logic
const rawCRMService = new CRMService();

export const crmService = {
  createContact: withErrorHandling('crm', 'createContact', rawCRMService.createContact.bind(rawCRMService)),
  getContact: withErrorHandling('crm', 'getContact', rawCRMService.getContact.bind(rawCRMService)),
  updateContact: withErrorHandling('crm', 'updateContact', rawCRMService.updateContact.bind(rawCRMService)),
  searchContacts: withErrorHandling('crm', 'searchContacts', rawCRMService.searchContacts.bind(rawCRMService)),
  createDeal: withErrorHandling('crm', 'createDeal', rawCRMService.createDeal.bind(rawCRMService)),
  createActivity: withErrorHandling('crm', 'createActivity', rawCRMService.createActivity.bind(rawCRMService)),
  getPipelines: withErrorHandling('crm', 'getPipelines', rawCRMService.getPipelines.bind(rawCRMService)),
  syncContactFromForm: withErrorHandling('crm', 'syncContactFromForm', rawCRMService.syncContactFromForm.bind(rawCRMService)),
  healthCheck: withErrorHandling('crm', 'healthCheck', rawCRMService.healthCheck.bind(rawCRMService), { maxAttempts: 1 }),
};

export { CRMService };
