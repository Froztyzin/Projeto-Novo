import { useState } from 'react';
import type { Member, Plan, Payment, Expense, Role, User, AuditLog } from '../types';
import { MemberStatus, PaymentStatus, ExpenseCategory, ExpenseStatus, Permission, LogActionType } from '../types';

const initialPlans: Plan[] = [
  { id: 'plan1', name: 'Básico Mensal', price: 30, durationInMonths: 1, dueDateDayOfMonth: 5 },
  { id: 'plan2', name: 'Pro Trimestral', price: 80, durationInMonths: 3 },
  { id: 'plan3', name: 'Elite Anual', price: 300, durationInMonths: 12, dueDateDayOfMonth: 1 },
];

const initialMembers: Member[] = [
  { id: 'mem1', name: 'Alice Johnson', email: 'alice@example.com', password: 'password', telefone: '(11) 98765-4321', joinDate: new Date('2023-01-15'), planId: 'plan3', status: MemberStatus.Active },
  { id: 'mem2', name: 'Bob Williams', email: 'bob@example.com', password: 'password', telefone: '(21) 91234-5678', joinDate: new Date('2023-03-22'), planId: 'plan1', status: MemberStatus.Active },
  { id: 'mem3', name: 'Charlie Brown', email: 'charlie@example.com', joinDate: new Date(new Date().setMonth(new Date().getMonth() - 2)), planId: 'plan2', status: MemberStatus.Pending },
  { id: 'mem4', name: 'Diana Prince', email: 'diana@example.com', telefone: '(31) 99999-8888', joinDate: new Date('2022-11-01'), planId: 'plan3', status: MemberStatus.Inactive },
  { id: 'mem5', name: 'Ethan Hunt', email: 'ethan@example.com', joinDate: new Date('2023-06-20'), planId: 'plan1', status: MemberStatus.Active },
];

const generateInitialPayments = (members: Member[], plans: Plan[]): Payment[] => {
    const payments: Payment[] = [];
    const today = new Date();
    members.forEach(member => {
        const plan = plans.find(p => p.id === member.planId);
        if (!plan) return;
        let paymentCycleStartDate = new Date(member.joinDate);
        while (paymentCycleStartDate <= today) {
            const dueDate = new Date(paymentCycleStartDate);
            if (plan.dueDateDayOfMonth) {
                dueDate.setDate(plan.dueDateDayOfMonth);
                if (paymentCycleStartDate.getTime() === member.joinDate.getTime() && member.joinDate.getDate() > plan.dueDateDayOfMonth) {
                   dueDate.setMonth(dueDate.getMonth() + 1);
                }
            }
            if (dueDate > today) break;
            let status = PaymentStatus.Paid;
            if (member.status === MemberStatus.Pending) {
                status = PaymentStatus.Overdue;
                payments.push({ id: `pay${payments.length + 1}`, memberId: member.id, planId: member.planId, description: `Pagamento pendente para ${plan.name}`, amount: plan.price, date: dueDate, status, paidDate: undefined });
                break; 
            }
            if (member.status === MemberStatus.Inactive && dueDate > new Date('2023-03-01')) break;
            
            const isPaid = status === PaymentStatus.Paid;
            payments.push({ 
                id: `pay${payments.length + 1}`, 
                memberId: member.id, 
                planId: member.planId, 
                description: `Pagamento para ${plan.name}`, 
                amount: plan.price, 
                date: dueDate, 
                status,
                paidDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000) : undefined
            });
            paymentCycleStartDate.setMonth(paymentCycleStartDate.getMonth() + plan.durationInMonths);
        }
    });
    return payments.sort((a,b) => b.date.getTime() - a.date.getTime());
};

const initialExpenses: Expense[] = [
    { id: 'exp1', description: 'Aluguel do espaço', amount: 1200, date: new Date(new Date().setDate(1)), category: ExpenseCategory.Rent, status: ExpenseStatus.Paid },
    { id: 'exp2', description: 'Pagamento de treinador', amount: 800, date: new Date(new Date().setDate(5)), category: ExpenseCategory.Salaries, status: ExpenseStatus.Paid },
    { id: 'exp3', description: 'Manutenção de esteira', amount: 150, date: new Date(new Date().setDate(10)), category: ExpenseCategory.Equipment, status: ExpenseStatus.Pending },
    { id: 'exp4', description: 'Anúncios em mídias sociais', amount: 200, date: new Date(new Date().setDate(15)), category: ExpenseCategory.Marketing, status: ExpenseStatus.Paid },
];

const initialRoles: Role[] = [
    { id: 'role_admin', name: 'Administrador', description: 'Acesso total a todas as funcionalidades do sistema.', permissions: Object.values(Permission), isEditable: false },
    { id: 'role_manager', name: 'Gerente', description: 'Gerencia alunos, planos, pagamentos e finanças.', permissions: [ Permission.VIEW_DASHBOARD, Permission.VIEW_MEMBERS, Permission.CREATE_MEMBERS, Permission.UPDATE_MEMBERS, Permission.DELETE_MEMBERS, Permission.VIEW_PLANS, Permission.CREATE_PLANS, Permission.UPDATE_PLANS, Permission.DELETE_PLANS, Permission.VIEW_PAYMENTS, Permission.CREATE_PAYMENTS, Permission.UPDATE_PAYMENTS, Permission.DELETE_PAYMENTS, Permission.VIEW_EXPENSES, Permission.CREATE_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.VIEW_REPORTS, Permission.VIEW_CALENDAR, Permission.MANAGE_SETTINGS ], isEditable: true },
    { id: 'role_staff', name: 'Recepcionista', description: 'Acesso para gerenciar alunos e registrar pagamentos.', permissions: [ Permission.VIEW_DASHBOARD, Permission.VIEW_MEMBERS, Permission.CREATE_MEMBERS, Permission.UPDATE_MEMBERS, Permission.VIEW_PAYMENTS, Permission.CREATE_PAYMENTS, Permission.UPDATE_PAYMENTS, Permission.VIEW_CALENDAR ], isEditable: true }
];

const initialUsers: User[] = [
    { id: 'user1', name: 'Admin User', email: 'admin@elite.com', password: 'password', roleId: 'role_admin' },
    { id: 'user2', name: 'Gerente User', email: 'gerente@elite.com', password: 'password', roleId: 'role_manager' },
    { id: 'user3', name: 'Staff User', email: 'staff@elite.com', password: 'password', roleId: 'role_staff' },
];

const initialAuditLogs: AuditLog[] = [
    { id: 'log1', timestamp: new Date(new Date().getTime() - 1000 * 60 * 5), userId: 'user2', userName: 'Gerente User', action: LogActionType.CREATE_MEMBER, details: 'Adicionou o aluno(a) "Ethan Hunt".' },
    { id: 'log2', timestamp: new Date(new Date().getTime() - 1000 * 60 * 15), userId: 'user1', userName: 'Admin User', action: LogActionType.UPDATE_PLAN, details: 'Atualizou o plano "Elite Anual".' },
    { id: 'log3', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60), userId: 'user3', userName: 'Staff User', action: LogActionType.CREATE_PAYMENT, details: 'Registrou pagamento de R$30,00 para "Bob Williams".' },
    { id: 'log4', timestamp: new Date(new Date().getTime() - 1000 * 60 * 120), userId: 'user1', userName: 'Admin User', action: LogActionType.USER_LOGIN, details: 'Fez login no sistema.' },
];

export const useMockData = () => {
    const [data] = useState(() => {
        const plans = initialPlans;
        const members = initialMembers;
        const payments = generateInitialPayments(members, plans);
        const expenses = initialExpenses;
        const roles = initialRoles;
        const users = initialUsers;
        const auditLogs = initialAuditLogs;

        return { plans, members, payments, expenses, roles, users, auditLogs };
    });

    return data;
};
