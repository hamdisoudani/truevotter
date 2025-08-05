import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  redditUsername?: string;
  redditId?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async linkReddit(redditUsername: string, redditId: string): Promise<User> {
    const response = await apiClient.patch('/auth/link-reddit', {
      redditUsername,
      redditId,
    });
    return response.data;
  },
};
