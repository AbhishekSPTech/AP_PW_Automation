//Employee API Client
//Handles OrangeHRM PIM employee CRUD operations (session-cookie auth via storageState)

//API Layer - Data Control

import { BaseAPIClient } from '../base.client';
import { createLogger } from '../../core/logger';
import { EmployeeModel, CreateEmployeeRequest } from '../models/employee.model';

const logger = createLogger('EmployeeAPIClient');

export interface UpdateEmployeeRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

//OrangeHRM wraps every response body in { data, meta, rels }
interface Envelope<T> {
  data: T;
}

export class EmployeeClient extends BaseAPIClient {
  //Create employee
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<EmployeeModel> {
    logger.info('Creating employee', { employeeId: employeeData.employeeId });

    const response = await this.post('/pim/employees', {
      data: { ...employeeData, empPicture: null },
    });

    this.verifyStatus(response, 200);
    const { data } = await this.parseJSON<Envelope<EmployeeModel>>(response);

    logger.info('Employee created successfully', { empNumber: data.empNumber });
    return data;
  }

  //Get employee by empNumber
  async getEmployee(empNumber: number): Promise<EmployeeModel> {
    logger.info('Fetching employee', { empNumber });

    const response = await this.get(`/pim/employees/${empNumber}/personal-details`, {
      retry: true,
    });

    this.verifyStatus(response, 200);
    const { data } = await this.parseJSON<Envelope<EmployeeModel>>(response);
    return data;
  }

  //Search employees by name or employee ID
  async searchEmployees(nameOrId: string): Promise<EmployeeModel[]> {
    logger.info('Searching employees', { nameOrId });

    const response = await this.get('/pim/employees', {
      params: { nameOrId, limit: '50' },
      retry: true,
    });

    this.verifyStatus(response, 200);
    const { data } = await this.parseJSON<Envelope<EmployeeModel[]>>(response);
    return data;
  }

  //Update employee personal details
  //The PUT replaces the record, so merge onto current values to avoid clearing employeeId
  async updateEmployee(
    empNumber: number,
    employeeData: UpdateEmployeeRequest
  ): Promise<EmployeeModel> {
    logger.info('Updating employee', { empNumber, updates: employeeData });

    const current = await this.getEmployee(empNumber);
    const response = await this.put(`/pim/employees/${empNumber}/personal-details`, {
      data: {
        firstName: current.firstName,
        middleName: current.middleName,
        lastName: current.lastName,
        employeeId: current.employeeId,
        ...employeeData,
      },
    });

    this.verifyStatus(response, 200);
    const { data } = await this.parseJSON<Envelope<EmployeeModel>>(response);

    logger.info('Employee updated successfully', { empNumber });
    return data;
  }

  //Delete employee
  async deleteEmployee(empNumber: number): Promise<void> {
    logger.info('Deleting employee', { empNumber });

    const response = await this.delete('/pim/employees', {
      data: { ids: [empNumber] },
    });

    this.verifyStatus(response, 200);
    logger.info('Employee deleted successfully', { empNumber });
  }
}
