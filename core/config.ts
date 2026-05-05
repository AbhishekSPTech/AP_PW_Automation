//Core Configuration Utility
//Handles environment variables and configuration management

//Framework - only - Not accessible from tests

  interface Config {
  baseURL: string;
  apiURL: string;
  env: string;
  screenshotsDir: string;
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
      Username: string;
      password: string;
    };
    adminUser: {
      email: string;
      Username: string;
      password: string;
    };
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable "${name}" is not set. Ensure your env file is loaded correctly.`);
  }
  return value;
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
      baseURL: requireEnv('BASE_URL'),
      apiURL: requireEnv('API_URL'),
      env,
      screenshotsDir: process.env.SCREENSHOTS_DIR || 'screenshots',
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
          email: requireEnv('CLIENT_USER_EMAIL'),
          Username: requireEnv('CLIENT_USER_USERNAME'),
          password: requireEnv('CLIENT_USER_PASSWORD'),
        },
        adminUser: {
          email: requireEnv('ADMIN_USER_EMAIL'),
          Username: requireEnv('ADMIN_USER_USERNAME'),
          password: requireEnv('ADMIN_USER_PASSWORD'),
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

  public getScreenshotsDir(): string {
    return this.config.screenshotsDir;
  }

  public getTimeout(type: 'action' | 'navigation' | 'test'): number {
    return this.config.timeout[type];
  }

  public getCredentials(userType: 'clientUser' | 'adminUser') {
    return this.config.credentials[userType];
  }
}

export const config = ConfigManager.getInstance();
