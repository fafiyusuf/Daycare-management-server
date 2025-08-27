// src/lib/api/family.ts

import api from '@/lib/api';

export interface Family {
    id: number;
    name: string;
    address: string;
    emergency_contact: string;
}

export interface FamilyAPIResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Family[];
}

export const familyAPI = {
    getFamilies: async (): Promise<Family[]> => {
        try {
            const response = await api.get<FamilyAPIResponse>('/families/');
            return response.data.results;
        } catch (error) {
            console.error("API Error: Failed to fetch families", error);
            throw error;
        }
    },
    createFamily: async (familyData: Omit<Family, 'id'>): Promise<Family> => {
        try {
            const response = await api.post<Family>('/families/', familyData);
            return response.data;
        } catch (error) {
            console.error("API Error: Failed to create family", error);
            throw error;
        }
    },
};
