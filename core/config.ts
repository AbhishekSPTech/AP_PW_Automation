/**
 * Core Configuration Utility
 * Handles environment variables and configuration management
 * 
 * Framework-only - Not accessible from tests
 */

interface Config {
  baseURL: string;
  apiURL: string;
  env: string;
  timeout: {
    action: number;
    navigation: number;
    test: number;
  };
  retry: {
    attempts: number;
    delay: number;
  };
  credentials: {
    clientUser: {
      email: string;
      password: string;
    };
    adminUser: {
      email: string;
      password: string;
    };
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): Config {
    const env = process.env.ENV || 'qa';

    return {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      apiURL: process.env.API_URL || 'http://localhost:3000/api',
      env,
      timeout: {
        action: parseInt(process.env.ACTION_TIMEOUT || '30000', 10),
        navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10),
        test: parseInt(process.env.TEST_TIMEOUT || '120000', 10),
      },
      retry: {
        attempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
        delay: parseInt(process.env.RETRY_DELAY || '1000', 10),
      },
      credentials: {
        clientUser: {
          email: process.env.CLIENT_USER_EMAIL || 'client@example.com',
          password: process.env.CLIENT_USER_PASSWORD || 'password123',
        },
        adminUser: {
          email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
          password: process.env.ADMIN_USER_PASSWORD || 'admin123',
        },
      },
    };
  }

  public get(): Config {
    return this.config;
  }

  public getBaseURL(): string {
    return this.config.baseURL;
  }

  public getAPIURL(): string {
    return this.config.apiURL;
  }

  public getEnv(): string {
    return this.config.env;
  }

  public getTimeout(type: 'action' | 'navigation' | 'test'): number {
    return this.config.timeout[type];
  }

  public getCredentials(userType: 'clientUser' | 'adminUser') {
    return this.config.credentials[userType];
  }
}

export const config = ConfigManager.getInstance();
