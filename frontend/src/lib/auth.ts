import axios from "axios"

const API_BASE_URL = 'http://localhost:8000'

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
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      username,
    });
    return response.data;
  },

  async getProfile(token: string): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async linkReddit(token: string, redditUsername: string, redditId: string): Promise<User> {
    const response = await axios.patch(`${API_BASE_URL}/auth/link-reddit`, {
      redditUsername,
      redditId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
