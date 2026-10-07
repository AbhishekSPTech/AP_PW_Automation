//Employee Validator
//Validates employee data(shared between API and UI layers)
//Shared Infrastructure - Validators

import { z } from 'zod';
import { EmployeeModel } from '../api/models/employee.model';
import { createLogger } from '../core/logger';

const logger = createLogger('EmployeeValidator');

//Employee schema validation using Zod
const employeeSchema = z.object({
  empNumber: z.number().int().positive('empNumber is required'),
  employeeId: z.string().nullable(),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string(),
  lastName: z.string().min(1, 'Last name is required'),
});

export class EmployeeValidator {

  //Validate employee object
  static validate(employee: EmployeeModel): boolean {
    try {
      employeeSchema.parse(employee);
      logger.debug('Employee validation passed', { empNumber: employee.empNumber });
      return true;
    } catch (error) {
      logger.error('Employee validation failed', error);
      throw error;
    }
  }
}
