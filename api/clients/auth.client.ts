// Auth API Client
// Handles authentication operations

// API Layer - Data Control

import { APIRequestContext } from '@playwright/test';
import { BaseAPIClient } from '../base.client';
import { createLogger } from '../../core/logger';

const logger = createLogger('AuthAPIClient');

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class AuthClient extends BaseAPIClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    logger.info('Logging in user', { email: credentials.email });

    const response = await this.post('/auth/login', {
      data: credentials,
      retry: true,
    });

    this.verifyStatus(response, 200);
    const data = await this.parseJSON<AuthResponse>(response);

    logger.info('Login successful', { userId: data.user.id });
    return data;
  }

  // Logout user
  async logout(token: string): Promise<void> {
    logger.info('Logging out user');

    const response = await this.post('/auth/logout', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.verifyStatus(response, 200);
    logger.info('Logout successful');
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    logger.info('Refreshing token');

    const response = await this.post('/auth/refresh', {
      data: { refreshToken },
    });

    this.verifyStatus(response, 200);
    return await this.parseJSON<AuthResponse>(response);
  }

  // Verify token
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await this.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status() === 200;
    } catch (error) {
      logger.error('Token verification failed', error);
      return false;
    }
  }
}
