
export enum PaymentStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
  Overdue = 'Vencido',
}

export enum ExpenseStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
  Overdue = 'Vencido',
}

export enum MemberStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
  Pending = 'Pendente',
}

export enum ExpenseCategory {
    Salaries = 'Salários',
    Rent = 'Aluguel',
    Equipment = 'Equipamentos',
    Marketing = 'Marketing',
    Other = 'Outros',
}

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  // Members
  VIEW_MEMBERS = 'VIEW_MEMBERS',
  CREATE_MEMBERS = 'CREATE_MEMBERS',
  UPDATE_MEMBERS = 'UPDATE_MEMBERS',
  DELETE_MEMBERS = 'DELETE_MEMBERS',
  // Plans
  VIEW_PLANS = 'VIEW_PLANS',
  CREATE_PLANS = 'CREATE_PLANS',
  UPDATE_PLANS = 'UPDATE_PLANS',
  DELETE_PLANS = 'DELETE_PLANS',
  // Payments
  VIEW_PAYMENTS = 'VIEW_PAYMENTS',
  CREATE_PAYMENTS = 'CREATE_PAYMENTS',
  UPDATE_PAYMENTS = 'UPDATE_PAYMENTS',
  DELETE_PAYMENTS = 'DELETE_PAYMENTS',
  // Expenses
  VIEW_EXPENSES = 'VIEW_EXPENSES',
  CREATE_EXPENSES = 'CREATE_EXPENSES',
  UPDATE_EXPENSES = 'UPDATE_EXPENSES',
  DELETE_EXPENSES = 'DELETE_EXPENSES',
  // Reports
  VIEW_REPORTS = 'VIEW_REPORTS',
  // Calendar
  VIEW_CALENDAR = 'VIEW_CALENDAR',
  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_ROLES = 'MANAGE_ROLES',
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationInMonths: number;
  dueDateDayOfMonth?: number;
}

export interface Payment {
  id: string;
  memberId: string;
  planId: string;
  description?: string;
  amount: number;
  date: Date; // Due Date
  paidDate?: Date; // Actual payment date
  status: PaymentStatus;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  telefone?: string;
  joinDate: Date;
  planId: string;
  status: MemberStatus;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  status?: ExpenseStatus;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isEditable?: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  roleId: string;
}


export type ViewType = 'dashboard' | 'members' | 'plans' | 'payments' | 'expenses' | 'reports' | 'calendar' | 'settings';