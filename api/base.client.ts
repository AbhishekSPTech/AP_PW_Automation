//Base API Client
//Provides common functionality for all API clients

//API Layer - Data Control


import { APIRequestContext, APIResponse } from '@playwright/test';
import { createLogger } from '../core/logger';
import { config } from '../core/config';
import { retry } from '../core/retries';

const logger = createLogger('BaseAPIClient');

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: any;
  retry?: boolean;
}

export class BaseAPIClient {
  protected request: APIRequestContext;
  protected baseURL: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = config.getAPIURL();
  }


  //GET request

  protected async get(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    logger.logRequest('GET', url, options.params);

    const makeRequest = async () => {
      return await this.request.get(url, {
        headers: options.headers,
        params: options.params,
      });
    };

    const response = options.retry
      ? await retry(makeRequest)
      : await makeRequest();

    logger.logResponse(response.status(), url);
    return response;
  }


  //POST request

  protected async post(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    logger.logRequest('POST', url, options.data);

    const makeRequest = async () => {
      return await this.request.post(url, {
        headers: options.headers,
        data: options.data,
      });
    };

    const response = options.retry
      ? await retry(makeRequest)
      : await makeRequest();

    logger.logResponse(response.status(), url);
    return response;
  }


  //PUT request

  protected async put(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    logger.logRequest('PUT', url, options.data);

    const makeRequest = async () => {
      return await this.request.put(url, {
        headers: options.headers,
        data: options.data,
      });
    };

    const response = options.retry
      ? await retry(makeRequest)
      : await makeRequest();

    logger.logResponse(response.status(), url);
    return response;
  }


  //PATCH request

  protected async patch(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    logger.logRequest('PATCH', url, options.data);

    const response = await this.request.patch(url, {
      headers: options.headers,
      data: options.data,
    });

    logger.logResponse(response.status(), url);
    return response;
  }


  //DELETE request

  protected async delete(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    logger.logRequest('DELETE', url);

    const response = await this.request.delete(url, {
      headers: options.headers,
    });

    logger.logResponse(response.status(), url);
    return response;
  }


  //Verify response status

  protected verifyStatus(response: APIResponse, expectedStatus: number): void {
    if (response.status() !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, got ${response.status()}`
      );
    }
  }


  //Parse JSON response

  protected async parseJSON<T>(response: APIResponse): Promise<T> {
    return await response.json();
  }
}
