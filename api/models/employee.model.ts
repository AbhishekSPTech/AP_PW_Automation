//Employee Data Model
//Represents OrangeHRM PIM employee entity structure

//API Layer - Data Models

export interface EmployeeModel {
  empNumber: number;
  employeeId: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
}

//Employee builder for test data
export class EmployeeBuilder {
  //Create random test employee (employeeId max length is 10 in OrangeHRM)
  static createRandomEmployee(): CreateEmployeeRequest {
    const suffix = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    return {
      firstName: 'Test',
      middleName: '',
      lastName: `Employee${suffix}`,
      employeeId: `E${suffix}`,
    };
  }
}
