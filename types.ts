
export type ViewType = 'dashboard' | 'members' | 'plans' | 'payments' | 'expenses' | 'reports' | 'calendar' | 'users' | 'settings' | 'audit-log';

export type AuthView = 'adminLogin' | 'memberLogin' | 'requestReset' | 'resetPassword' | 'combinedLogin';

export enum MemberStatus {
    Active = 'Ativo',
    Inactive = 'Inativo',
    Pending = 'Pendente',
    Archived = 'Arquivado',
    Prospect = 'Potencial',
}

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

export enum ExpenseCategory {
    Rent = 'Aluguel',
    Salaries = 'Salários',
    Equipment = 'Equipamentos',
    Marketing = 'Marketing',
    Supplies = 'Suprimentos',
    Utilities = 'Contas',
    Other = 'Outros',
}

export enum AnnouncementType {
    Info = 'Informativo',
    Promotion = 'Promoção',
    Warning = 'Aviso Urgente',
}

export enum LogActionType {
    USER_LOGIN = 'Login de Usuário',
    USER_LOGOUT = 'Logout de Usuário',
    CREATE_MEMBER = 'Criação de Aluno',
    UPDATE_MEMBER = 'Atualização de Aluno',
    DELETE_MEMBER = 'Exclusão de Aluno',
    CREATE_PLAN = 'Criação de Plano',
    UPDATE_PLAN = 'Atualização de Plano',
    DELETE_PLAN = 'Exclusão de Plano',
    CREATE_PAYMENT = 'Criação de Pagamento',
    UPDATE_PAYMENT = 'Atualização de Pagamento',
    DELETE_PAYMENT = 'Exclusão de Pagamento',
    CREATE_EXPENSE = 'Criação de Despesa',
    UPDATE_EXPENSE = 'Atualização de Despesa',
    DELETE_EXPENSE = 'Exclusão de Despesa',
    CREATE_USER = 'Criação de Usuário',
    UPDATE_USER = 'Atualização de Usuário',
    DELETE_USER = 'Exclusão de Usuário',
    CREATE_ROLE = 'Criação de Função',
    UPDATE_ROLE = 'Atualização de Função',
    DELETE_ROLE = 'Exclusão de Função',
    IMPORT_DATA = 'Importação de Dados',
    UPDATE_SETTINGS = 'Atualização de Configurações',
    CREATE_ANNOUNCEMENT = 'Criação de Comunicado',
    UPDATE_ANNOUNCEMENT = 'Atualização de Comunicado',
    DELETE_ANNOUNCEMENT = 'Exclusão de Comunicado',
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
  // Users & Roles
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USERS = 'CREATE_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  // Audit Log
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  // Announcements
  VIEW_ANNOUNCEMENTS = 'VIEW_ANNOUNCEMENTS',
  CREATE_ANNOUNCEMENTS = 'CREATE_ANNOUNCEMENTS',
  UPDATE_ANNOUNCEMENTS = 'UPDATE_ANNOUNCEMENTS',
  DELETE_ANNOUNCEMENTS = 'DELETE_ANNOUNCEMENTS',
}

export interface Member {
  id: string;
  name: string;
  email: string;
  password?: string;
  telefone?: string;
  joinDate: Date;
  planId: string;
  status: MemberStatus;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
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
  amount: number;
  date: Date;
  paidDate?: Date;
  status: PaymentStatus;
  description?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  status?: ExpenseStatus;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    createdAt: Date;
    authorId: string; // User ID
    readByMemberIds: string[];
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
  password?: string;
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
