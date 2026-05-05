//User Data Model
//Represents user entity structure

//API Layer - Data Models


export interface UserModel {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'client';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

//User builder for test data
export class UserBuilder {
  private user: Partial<UserModel> = {};

  withId(id: string): this {
    this.user.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withRole(role: UserModel['role']): this {
    this.user.role = role;
    return this;
  }

  withActiveStatus(isActive: boolean): this {
    this.user.isActive = isActive;
    return this;
  }

  build(): UserModel {
    return {
      id: this.user.id || '',
      email: this.user.email || '',
      name: this.user.name || '',
      role: this.user.role || 'user',
      isActive: this.user.isActive ?? true,
      createdAt: this.user.createdAt || new Date().toISOString(),
      updatedAt: this.user.updatedAt || new Date().toISOString(),
    };
  }

  //Create random test user
  static createRandomUser(): UserModel {
    const timestamp = Date.now();
    return new UserBuilder()
      .withId(`user_${timestamp}`)
      .withEmail(`test.user.${timestamp}@example.com`)
      .withName(`Test User ${timestamp}`)
      .withRole('user')
      .withActiveStatus(true)
      .build();
  }
}
