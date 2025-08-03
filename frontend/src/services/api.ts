import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/api/auth/login', credentials);
    return response.data.data!;
  }

  async register(userData: RegisterRequest): Promise<void> {
    await this.api.post('/api/auth/register', userData);
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/api/auth/profile');
    return response.data.data!;
  }

  async verifyEmail(token: string): Promise<void> {
    await this.api.get(`/api/auth/verify-email/${token}`);
  }

  // Profile endpoints
  async getProfiles(filters?: any): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/api/profiles', { params: filters });
    return response.data.data!;
  }

  async createProfile(profileData: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/api/profiles', profileData);
    return response.data.data!;
  }

  async updateProfile(id: string, profileData: any): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`/api/profiles/${id}`, profileData);
    return response.data.data!;
  }

  async deleteProfile(id: string): Promise<void> {
    await this.api.delete(`/api/profiles/${id}`);
  }

  // Admin endpoints
  async getPendingProfiles(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/api/admin/profiles/pending');
    return response.data.data!;
  }

  async approveProfile(id: string, notes?: string): Promise<void> {
    await this.api.post(`/api/admin/profiles/${id}/approve`, { notes });
  }

  async rejectProfile(id: string, reason: string, notes?: string): Promise<void> {
    await this.api.post(`/api/admin/profiles/${id}/reject`, { reason, notes });
  }

  async getStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/api/admin/stats');
    return response.data.data!;
  }

  async getAllUsers(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/api/admin/users');
    return response.data.data!;
  }

  async updateUserRole(id: string, role: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.patch(`/api/admin/users/${id}/role`, { role });
    return response.data.data!;
  }

  async getAdminActions(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/api/admin/actions');
    return response.data.data!;
  }

  // Interest endpoints
  async expressInterest(profileId: string, notes?: string): Promise<void> {
    await this.api.post('/api/interests', { profileId, notes });
  }

  async withdrawInterest(interestId: string): Promise<void> {
    await this.api.delete(`/api/interests/${interestId}`);
  }

  async getMyInterests(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/api/interests/my');
    return response.data.data!;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();