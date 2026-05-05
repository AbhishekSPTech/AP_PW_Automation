//User API Client
//Handles user CRUD operations

//API Layer - Data Control

import { APIRequestContext } from '@playwright/test';
import { BaseAPIClient } from '../base.client';
import { createLogger } from '../../core/logger';
import { UserModel } from '../models/user.model';

const logger = createLogger('UserAPIClient');

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
}

export class UserClient extends BaseAPIClient {
  private authToken?: string;

  constructor(request: APIRequestContext, authToken?: string) {
    super(request);
    this.authToken = authToken;
  }


  //Set auth token
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  //Get auth headers
  private getAuthHeaders(): Record<string, string> {
    return this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : {};
  }

  //Create user
  async createUser(userData: CreateUserRequest): Promise<UserModel> {
    logger.info('Creating user', { email: userData.email });

    const response = await this.post('/users', {
      headers: this.getAuthHeaders(),
      data: userData,
      retry: true,
    });

    this.verifyStatus(response, 201);
    const data = await this.parseJSON<UserModel>(response);

    logger.info('User created successfully', { userId: data.id });
    return data;
  }

  //Get user by ID
  async getUserById(userId: string): Promise<UserModel> {
    logger.info('Fetching user', { userId });

    const response = await this.get(`/users/${userId}`, {
      headers: this.getAuthHeaders(),
      retry: true,
    });

    this.verifyStatus(response, 200);
    return await this.parseJSON<UserModel>(response);
  }

  //Get user by email
  async getUserByEmail(email: string): Promise<UserModel> {
    logger.info('Fetching user by email', { email });

    const response = await this.get('/users', {
      headers: this.getAuthHeaders(),
      params: { email },
      retry: true,
    });

    this.verifyStatus(response, 200);
    const users = await this.parseJSON<UserModel[]>(response);

    if (users.length === 0) {
      throw new Error(`User not found with email: ${email}`);
    }

    return users[0];
  }

  //Update user
  async updateUser(
    userId: string,
    userData: UpdateUserRequest
  ): Promise<UserModel> {
    logger.info('Updating user', { userId, updates: userData });

    const response = await this.put(`/users/${userId}`, {
      headers: this.getAuthHeaders(),
      data: userData,
    });

    this.verifyStatus(response, 200);
    const data = await this.parseJSON<UserModel>(response);

    logger.info('User updated successfully', { userId });
    return data;
  }

  //Delete user
  async deleteUser(userId: string): Promise<void> {
    logger.info('Deleting user', { userId });

    const response = await this.delete(`/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    this.verifyStatus(response, 204);
    logger.info('User deleted successfully', { userId });
  }

  //Get all users
  async getAllUsers(): Promise<UserModel[]> {
    logger.info('Fetching all users');

    const response = await this.get('/users', {
      headers: this.getAuthHeaders(),
      retry: true,
    });

    this.verifyStatus(response, 200);
    return await this.parseJSON<UserModel[]>(response);
  }
}
