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

export enum LogActionType {
    USER_LOGIN = 'USER_LOGIN',
    USER_LOGOUT = 'USER_LOGOUT',
    CREATE_MEMBER = 'CREATE_MEMBER',
    UPDATE_MEMBER = 'UPDATE_MEMBER',
    DELETE_MEMBER = 'DELETE_MEMBER',
    CREATE_PLAN = 'CREATE_PLAN',
    UPDATE_PLAN = 'UPDATE_PLAN',
    DELETE_PLAN = 'DELETE_PLAN',
    CREATE_PAYMENT = 'CREATE_PAYMENT',
    UPDATE_PAYMENT = 'UPDATE_PAYMENT',
    DELETE_PAYMENT = 'DELETE_PAYMENT',
    CREATE_EXPENSE = 'CREATE_EXPENSE',
    UPDATE_EXPENSE = 'UPDATE_EXPENSE',
    DELETE_EXPENSE = 'DELETE_EXPENSE',
    CREATE_USER = 'CREATE_USER',
    UPDATE_USER = 'UPDATE_USER',
    DELETE_USER = 'DELETE_USER',
    CREATE_ROLE = 'CREATE_ROLE',
    UPDATE_ROLE = 'UPDATE_ROLE',
    DELETE_ROLE = 'DELETE_ROLE',
    IMPORT_DATA = 'IMPORT_DATA',
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
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
  // Users
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USERS = 'CREATE_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  // Reports
  VIEW_REPORTS = 'VIEW_REPORTS',
  // Calendar
  VIEW_CALENDAR = 'VIEW_CALENDAR',
  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  // Audit Log
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
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
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: LogActionType;
  details: string;
}


export type ViewType = 'dashboard' | 'members' | 'plans' | 'payments' | 'expenses' | 'users' | 'reports' | 'calendar' | 'settings' | 'audit-log';