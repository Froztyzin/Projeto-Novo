
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Member, Plan, Payment, Expense, Role, User, AuditLog, Permission, Announcement } from '../types';
import { MemberStatus, PaymentStatus, LogActionType } from '../types';
import { useToast } from './ToastContext';
import { useMockData } from '../hooks/useMockData';

interface AppContextType {
  isLoading: boolean;
  members: Member[];
  plans: Plan[];
  payments: Payment[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  announcements: Announcement[];
  isAuthenticated: boolean;
  currentUser: User | null;
  isAuthenticatedMember: boolean;
  currentMember: Member | null;
  roles: Role[];
  users: User[];
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loginMember: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateCurrentMemberProfile: (data: { email?: string, telefone?: string }) => void;
  requestPasswordResetForMember: (email: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resetMemberPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  addRole: (role: Omit<Role, 'id' | 'isEditable'>) => void;
  updateRole: (updatedRole: Role) => void;
  deleteRole: (roleId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (updatedMember: Member) => void;
  deleteMember: (memberId: string) => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (updatedPlan: Plan) => void;
  deletePlan: (planId: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (updatedPayment: Payment) => void;
  deletePayment: (paymentId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (updatedExpense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'|'createdAt'|'authorId'|'readByMemberIds'>) => void;
  updateAnnouncement: (updatedAnnouncement: Announcement) => void;
  deleteAnnouncement: (announcementId: string) => void;
  markAnnouncementAsRead: (announcementId: string) => void;
  markAllAnnouncementsAsRead: () => void;
  importData: (data: { members: Member[], plans: Plan[], payments: Payment[], expenses: Expense[] }) => void;
  runAutomatedBillingCycle: () => void;
  getAIResponse: (prompt: string) => Promise<string>;
  getDashboardInsights: (periodData: any) => Promise<string>;
  getReportInsights: (reportData: any) => Promise<string>;
  getMemberInsights: (member: Member, memberPayments: Payment[], memberPlan: Plan | null) => Promise<{ risk: 'Alto' | 'Médio' | 'Baixo', analysis: string }>;
  generatePaymentReminderMessage: (payment: Payment, member: Member) => Promise<string>;
  generateReengagementMessage: (member: Member, plan: Plan | null) => Promise<string>;
  getSystemNotifications: (billingSettings: any) => { title: string, message: string }[];
  addAuditLog: (action: LogActionType, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialData = useMockData();
    const { addToast } = useToast();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticatedMember, setIsAuthenticatedMember] = useState(false);
    const [currentMember, setCurrentMember] = useState<Member | null>(null);

    // Initialization
    useEffect(() => {
        const loadInitialData = () => {
            let paymentsData = initialData.payments;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            paymentsData = paymentsData.map(p => {
                if (p.status === PaymentStatus.Pending && new Date(p.date) < today) {
                    return { ...p, status: PaymentStatus.Overdue };
                }
                return p;
            });
            setPlans(initialData.plans);
            setMembers(initialData.members);
            setPayments(paymentsData);
            setExpenses(initialData.expenses);
            setAuditLogs(initialData.auditLogs);
            setAnnouncements(initialData.announcements);
            setRoles(initialData.roles);
            setUsers(initialData.users);

            // Auth check
            const storedUserId = localStorage.getItem('currentUserId');
            const storedMemberId = localStorage.getItem('currentMemberId');
            if (storedUserId) {
                const user = initialData.users.find(u => u.id === storedUserId);
                if (user) {
                    setIsAuthenticated(true);
                    setCurrentUser(user);
                }
            } else if (storedMemberId) {
                const member = initialData.members.find(m => m.id === storedMemberId);
                if (member) {
                    setIsAuthenticatedMember(true);
                    setCurrentMember(member);
                }
            }

            setIsLoading(false);
        };
        const timer = setTimeout(loadInitialData, 1200); // Simulate loading
        return () => clearTimeout(timer);
    }, [initialData]);
    
    // --- Methods ---

    const addAuditLog = (action: LogActionType, details: string) => {
        if (!currentUser) return;
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            userId: currentUser.id,
            userName: currentUser.name,
            action,
            details,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setIsAuthenticated(true);
            setCurrentUser(user);
            localStorage.setItem('currentUserId', user.id);
            addToast(`Bem-vindo, ${user.name}!`, 'success');
            addAuditLog(LogActionType.USER_LOGIN, 'Fez login no sistema.');
            return { success: true };
        }
        return { success: false, message: 'Credenciais inválidas.' };
    };

    const loginMember = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        const member = members.find(m => m.email === email);
        if (member && member.password === password) {
            setIsAuthenticatedMember(true);
            setCurrentMember(member);
            localStorage.setItem('currentMemberId', member.id);
            addToast(`Bem-vindo(a), ${member.name}!`, 'success');
            return { success: true };
        }
        if (member && !member.password) {
            return { success: false, message: 'Você precisa definir uma senha. Use o link "Esqueceu sua senha ou primeiro acesso?".' };
        }
        return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    const logout = () => {
        if(currentUser) {
            addAuditLog(LogActionType.USER_LOGOUT, 'Fez logout do sistema.');
        }
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('currentUserId');
        setIsAuthenticatedMember(false);
        setCurrentMember(null);
        localStorage.removeItem('currentMemberId');
        addToast('Você saiu com sucesso.', 'info');
    };

    const requestPasswordResetForMember = async (email: string): Promise<{ success: boolean; message: string; token?: string }> => {
        const memberIndex = members.findIndex(m => m.email === email);
        if (memberIndex === -1) {
            return { success: true, message: 'Se um aluno com este e-mail existir, um link de redefinição de senha foi enviado.' };
        }
        const token = `reset-${Date.now()}-${Math.random()}`;
        const expires = new Date(Date.now() + 3600000); // 1 hour expiry
        setMembers(prev => {
            const updatedMembers = [...prev];
            updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], passwordResetToken: token, passwordResetExpires: expires };
            return updatedMembers;
        });
        console.log(`Password reset token for ${email}: ${token}`);
        return { success: true, message: 'Se um aluno com este e-mail existir, um link de redefinição de senha foi enviado.', token };
    };

    const resetMemberPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        const memberIndex = members.findIndex(m => m.passwordResetToken === token);
        if (memberIndex === -1) {
            return { success: false, message: 'Token de redefinição inválido.' };
        }
        const member = members[memberIndex];
        if (!member.passwordResetExpires || new Date() > member.passwordResetExpires) {
            setMembers(prev => {
                const updatedMembers = [...prev];
                updatedMembers[memberIndex] = { ...member, passwordResetToken: undefined, passwordResetExpires: undefined };
                return updatedMembers;
            });
            return { success: false, message: 'Token de redefinição expirado. Por favor, solicite um novo.' };
        }
        setMembers(prev => {
            const updatedMembers = [...prev];
            updatedMembers[memberIndex] = { ...member, password: newPassword, passwordResetToken: undefined, passwordResetExpires: undefined };
            return updatedMembers;
        });
        return { success: true, message: 'Senha redefinida com sucesso!' };
    };
  
    const updateCurrentMemberProfile = (data: { email?: string; telefone?: string }) => {
        if (!currentMember) return;
        const updatedMember = { ...currentMember, ...data };
        setCurrentMember(updatedMember);
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        addToast('Perfil atualizado com sucesso!', 'success');
    };

    const hasPermission = (permission: Permission): boolean => {
        if (!currentUser) return false;
        const role = roles.find(r => r.id === currentUser.roleId);
        return role?.permissions.includes(permission) ?? false;
    };
  
    const addRole = (role: Omit<Role, 'id' | 'isEditable'>) => {
        const newRole = { ...role, id: `role_${Date.now()}`, isEditable: true };
        setRoles(prev => [...prev, newRole]);
        addToast('Função adicionada com sucesso!', 'success');
        addAuditLog(LogActionType.CREATE_ROLE, `Adicionou a função "${newRole.name}".`);
    };

    const updateRole = (updatedRole: Role) => {
        setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
        addToast('Função atualizada com sucesso!', 'success');
        addAuditLog(LogActionType.UPDATE_ROLE, `Atualizou a função "${updatedRole.name}".`);
    };

    const deleteRole = (roleId: string) => {
        const roleToDelete = roles.find(r => r.id === roleId);
        setRoles(prev => prev.filter(r => r.id !== roleId));
        addToast('Função excluída com sucesso!', 'success');
        if (roleToDelete) {
            addAuditLog(LogActionType.DELETE_ROLE, `Excluiu a função "${roleToDelete.name}".`);
        }
    };
  
    const addUser = (user: Omit<User, 'id'>) => {
        const newUser = { ...user, id: `user-${Date.now()}` };
        setUsers(prev => [...prev, newUser]);
        addToast('Usuário adicionado com sucesso!', 'success');
        addAuditLog(LogActionType.CREATE_USER, `Adicionou o usuário "${newUser.name}".`);
    };

    const updateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        addToast('Usuário atualizado com sucesso!', 'success');
        addAuditLog(LogActionType.UPDATE_USER, `Atualizou os dados do usuário "${updatedUser.name}".`);
    };

    const deleteUser = (userId: string) => {
        if (userId === currentUser?.id) {
            addToast('Você não pode excluir a si mesmo.', 'error');
            return;
        }
        const userToDelete = users.find(u => u.id === userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        addToast('Usuário excluído com sucesso!', 'success');
        if (userToDelete) {
            addAuditLog(LogActionType.DELETE_USER, `Excluiu o usuário "${userToDelete.name}".`);
        }
    };

    const addMember = (member: Omit<Member, 'id'>) => {
        const newMember = { ...member, id: `mem${Date.now()}` };
        setMembers(prev => [...prev, newMember]);
        addToast('Aluno adicionado com sucesso! Envie um link para que ele(a) defina a senha.', 'success');
        addAuditLog(LogActionType.CREATE_MEMBER, `Adicionou o aluno(a) "${newMember.name}".`);
    };
  
    const updateMember = (updatedMember: Member) => {
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        addToast('Aluno atualizado com sucesso!', 'success');
        addAuditLog(LogActionType.UPDATE_MEMBER, `Atualizou os dados do aluno(a) "${updatedMember.name}".`);
    };

    const deleteMember = (memberId: string) => {
        const memberToDelete = members.find(m => m.id === memberId);
        setMembers(prev => prev.filter(m => m.id !== memberId));
        addToast('Aluno excluído com sucesso!', 'success');
        if (memberToDelete) {
            addAuditLog(LogActionType.DELETE_MEMBER, `Excluiu o aluno(a) "${memberToDelete.name}".`);
        }
    };
  
    const addPlan = (plan: Omit<Plan, 'id'>) => {
        const newPlan = { ...plan, id: `plan${Date.now()}` };
        setPlans(prev => [...prev, newPlan]);
        addToast('Plano adicionado com sucesso!', 'success');
        addAuditLog(LogActionType.CREATE_PLAN, `Adicionou o plano "${newPlan.name}".`);
    };

    const updatePlan = (updatedPlan: Plan) => {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        addToast('Plano atualizado com sucesso!', 'success');
        addAuditLog(LogActionType.UPDATE_PLAN, `Atualizou o plano "${updatedPlan.name}".`);
    };
  
    const deletePlan = (planId: string) => {
        const planToDelete = plans.find(p => p.id === planId);
        setPlans(prev => prev.filter(p => p.id !== planId));
        addToast('Plano excluído com sucesso!', 'success');
        if (planToDelete) {
            addAuditLog(LogActionType.DELETE_PLAN, `Excluiu o plano "${planToDelete.name}".`);
        }
    };

    const addPayment = (payment: Omit<Payment, 'id'>) => {
        const newPayment = { ...payment, id: `pay${Date.now()}` };
        setPayments(prev => [newPayment, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        const member = members.find(m => m.id === payment.memberId);
        if(member && member.status === MemberStatus.Pending && payment.status === PaymentStatus.Paid) {
            updateMember({...member, status: MemberStatus.Active});
        }
        addToast('Pagamento registrado com sucesso!', 'success');
        addAuditLog(LogActionType.CREATE_PAYMENT, `Registrou pagamento de ${payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para "${member?.name || 'N/A'}".`);
    };

    const updatePayment = (updatedPayment: Payment) => {
        setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        addToast('Pagamento atualizado com sucesso!', 'success');
        const member = members.find(m => m.id === updatedPayment.memberId);
        addAuditLog(LogActionType.UPDATE_PAYMENT, `Atualizou pagamento de ${updatedPayment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para "${member?.name || 'N/A'}".`);
    };

    const deletePayment = (paymentId: string) => {
        const paymentToDelete = payments.find(p => p.id === paymentId);
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        addToast('Pagamento excluído com sucesso!', 'success');
        if (paymentToDelete) {
            const member = members.find(m => m.id === paymentToDelete.memberId);
            addAuditLog(LogActionType.DELETE_PAYMENT, `Excluiu pagamento de ${paymentToDelete.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de "${member?.name || 'N/A'}".`);
        }
    };

    const addExpense = (expense: Omit<Expense, 'id'>) => {
        const newExpense = { ...expense, id: `exp${Date.now()}` };
        setExpenses(prev => [newExpense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        addToast('Despesa adicionada com sucesso!', 'success');
        addAuditLog(LogActionType.CREATE_EXPENSE, `Adicionou a despesa "${newExpense.description}".`);
    };

    const updateExpense = (updatedExpense: Expense) => {
        setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        addToast('Despesa atualizada com sucesso!', 'success');
        addAuditLog(LogActionType.UPDATE_EXPENSE, `Atualizou a despesa "${updatedExpense.description}".`);
    };

    const deleteExpense = (expenseId: string) => {
        const expenseToDelete = expenses.find(e => e.id === expenseId);
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        addToast('Despesa excluída com sucesso!', 'success');
        if (expenseToDelete) {
            addAuditLog(LogActionType.DELETE_EXPENSE, `Excluiu a despesa "${expenseToDelete.description}".`);
        }
    };

    const addAnnouncement = (announcement: Omit<Announcement, 'id'|'createdAt'|'authorId'|'readByMemberIds'>) => {
        if (!currentUser) return;
        const newAnnouncement: Announcement = { 
            ...announcement, 
            id: `ann${Date.now()}`,
            createdAt: new Date(),
            authorId: currentUser.id,
            readByMemberIds: [],
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        addToast('Comunicado publicado com sucesso!', 'success');
        addAuditLog(LogActionType.CREATE_ANNOUNCEMENT, `Publicou o comunicado: "${newAnnouncement.title}".`);
    };

    const updateAnnouncement = (updatedAnnouncement: Announcement) => {
        setAnnouncements(prev => prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a));
        addToast('Comunicado atualizado com sucesso!', 'success');
        addAuditLog(LogActionType.UPDATE_ANNOUNCEMENT, `Atualizou o comunicado: "${updatedAnnouncement.title}".`);
    };

    const deleteAnnouncement = (announcementId: string) => {
        const toDelete = announcements.find(a => a.id === announcementId);
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        addToast('Comunicado excluído com sucesso!', 'success');
        if (toDelete) {
            addAuditLog(LogActionType.DELETE_ANNOUNCEMENT, `Excluiu o comunicado: "${toDelete.title}".`);
        }
    };

    const markAnnouncementAsRead = (announcementId: string) => {
        if (!currentMember) return;
        setAnnouncements(prev => prev.map(ann => {
            if (ann.id === announcementId && !ann.readByMemberIds.includes(currentMember.id)) {
                return { ...ann, readByMemberIds: [...ann.readByMemberIds, currentMember.id] };
            }
            return ann;
        }));
    };

    const markAllAnnouncementsAsRead = () => {
        if (!currentMember) return;
        setAnnouncements(prev => prev.map(ann => {
            if (!ann.readByMemberIds.includes(currentMember.id)) {
                return { ...ann, readByMemberIds: [...ann.readByMemberIds, currentMember.id] };
            }
            return ann;
        }));
    };

    const importData = (data: { members: Member[], plans: Plan[], payments: Payment[], expenses: Expense[] }) => {
        try {
            const parseDates = <T extends { [key: string]: any }>(items: T[], dateKeys: (keyof T)[]) => {
                return items.map(item => {
                    const newItem = { ...item };
                    dateKeys.forEach(key => {
                        if (newItem[key] && typeof newItem[key] === 'string') {
                            (newItem as any)[key] = new Date(newItem[key]);
                        }
                    });
                    return newItem;
                });
            };

            if (data.members) setMembers(parseDates(data.members, ['joinDate']));
            if (data.plans) setPlans(data.plans);
            if (data.payments) setPayments(parseDates(data.payments, ['date', 'paidDate']));
            if (data.expenses) setExpenses(parseDates(data.expenses, ['date']));
            addToast('Dados importados com sucesso!', 'success');
            addAuditLog(LogActionType.IMPORT_DATA, 'Realizou a importação de dados para o sistema.');

        } catch (error) {
            console.error("Erro ao importar dados:", error);
            addToast('Erro ao importar dados. Verifique o console.', 'error');
        }
    };
  
    // --- Mocked AI Functions ---
    const getAIResponse = async (prompt: string): Promise<string> => {
        console.log("AI Response requested for prompt:", prompt);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return `Esta é uma resposta simulada do assistente de IA. O backend está desativado para testes. Você perguntou sobre: **"${prompt}"**.`;
    };
  
    const getDashboardInsights = async (periodData: any): Promise<string> => {
        console.log("Dashboard insights requested with data:", periodData);
        await new Promise(resolve => setTimeout(resolve, 500));
        const revenue = periodData?.kpis?.revenueInPeriod ?? 0;
        const overdue = periodData?.kpis?.overdueInPeriod ?? 0;
        return `**Análise Fictícia:** A receita de **${revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}** parece estável. No entanto, observe os **${overdue}** pagamentos vencidos. **Sugestão:** Foque em contatar os alunos com pagamentos atrasados para regularizar a situação.`;
    };

    const getReportInsights = async (reportData: any): Promise<string> => {
        console.log("Report insights requested with data:", reportData);
        await new Promise(resolve => setTimeout(resolve, 500));
        const { netIncome, netIncomeChange, revenueByPlan, expensesByCategory, totalRevenue } = reportData;

        const formatChange = (change: number | null) => {
            if (change === null || !isFinite(change)) return "estável";
            return `${change >= 0 ? 'aumento' : 'queda'} de ${Math.abs(change).toFixed(1)}%`;
        }
        
        const topPlan = revenueByPlan.length > 0 ? revenueByPlan[0].name : 'N/A';
        const topExpense = expensesByCategory.length > 0 ? expensesByCategory[0].name : 'N/A';
        
        let analysis = `**Análise Fictícia Aprimorada:** No período, o **lucro líquido** foi de **${netIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}**, representando um(a) **${formatChange(netIncomeChange)}** em relação ao período anterior.`;
        
        if (netIncomeChange > 5) {
            analysis += " Um ótimo sinal de saúde financeira!";
        } else if (netIncomeChange < -5) {
            analysis += " É importante investigar as causas dessa queda.";
        }
        
        analysis += `\nA receita foi impulsionada pelo plano **${topPlan}**. As despesas foram lideradas por **${topExpense}**.`;
        
        const forecast = totalRevenue * (1 + (reportData.revenueChange / 100));
        
        analysis += `\n\n**Previsão:** Com base na tendência atual, a previsão de receita para o próximo período é de aproximadamente **${(forecast * 1.05).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}**.`;
        
        return analysis;
    };
  
    const getMemberInsights = async (member: Member, memberPayments: Payment[], memberPlan: Plan | null): Promise<{ risk: 'Alto' | 'Médio' | 'Baixo', analysis: string }> => {
        console.log("Member insights requested for:", member.name);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let risk: 'Alto' | 'Médio' | 'Baixo' = 'Médio';
        let analysis = `Análise fictícia para ${member.name}. O aluno parece engajado com o plano atual.`;

        if (member.status === MemberStatus.Inactive) {
            risk = 'Alto';
            analysis = `O status do aluno é **Inativo**, representando um alto risco de evasão.`;
        } else if (member.status === MemberStatus.Pending) {
            risk = 'Alto';
            analysis = `O aluno está com o status **Pendente**, indicando um alto risco se a situação não for resolvida.`;
        } else if (memberPayments.some(p => p.status === PaymentStatus.Overdue)) {
            risk = 'Médio';
            analysis = `O aluno possui pagamentos **vencidos**, representando um risco médio de evasão. É importante contatá-lo.`;
        } else {
            risk = 'Baixo';
            analysis = `O aluno está **Ativo** e com os pagamentos em dia. O risco de evasão é baixo.`;
        }
        
        return { risk, analysis };
    };

    const generatePaymentReminderMessage = async (payment: Payment, member: Member): Promise<string> => {
        console.log("Payment reminder requested for:", member.name);
        await new Promise(resolve => setTimeout(resolve, 500));
        return `👋 Olá, ${member.name.split(' ')[0]}!
    \nEsta é uma mensagem de lembrete fictícia sobre seu pagamento de **${payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}** que venceu em **${new Date(payment.date).toLocaleDateString('pt-BR')}**.
    \nPor favor, ignore se o pagamento já foi efetuado.
    \n_Equipe Ellite Corpus_`;
    };

    const generateReengagementMessage = async (member: Member, plan: Plan | null): Promise<string> => {
        console.log("Re-engagement message requested for:", member.name);
        await new Promise(resolve => setTimeout(resolve, 500));
        return `👋 Olá, ${member.name.split(' ')[0]}!
    \nSentimos sua falta aqui na Ellite Corpus! Esta é uma mensagem fictícia para reengajamento.
    \nLembramos do seu plano **${plan?.name || 'de treinamento'}** e gostaríamos de te ver de volta. Temos novidades esperando por você!
    \nQue tal voltar a treinar com a gente? 💪
    \n_Equipe Ellite Corpus_`;
    };

    // --- Billing Automation ---
    const runAutomatedBillingCycle = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentPayments = [...payments];
        let statusesUpdatedCount = 0;

        // 1. Update pending to overdue
        currentPayments = currentPayments.map(p => {
            if (p.status === PaymentStatus.Pending && new Date(p.date) < today) {
                statusesUpdatedCount++;
                return { ...p, status: PaymentStatus.Overdue };
            }
            return p;
        });

        // 2. Generate new recurring payments
        const newPaymentsToGenerate: Payment[] = [];
        const activeMembers = members.filter(m => m.status === MemberStatus.Active);

        activeMembers.forEach(member => {
            const plan = plans.find(p => p.id === member.planId);
            if (!plan || plan.durationInMonths <= 0) return;

            const memberPayments = currentPayments
                .filter(p => p.memberId === member.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const lastPaymentDate = memberPayments.length > 0 ? new Date(memberPayments[0].date) : new Date(member.joinDate);
            
            let nextDueDate = new Date(lastPaymentDate);

            while (nextDueDate <= today) {
                nextDueDate.setMonth(nextDueDate.getMonth() + plan.durationInMonths);

                if (plan.dueDateDayOfMonth) {
                    nextDueDate.setDate(plan.dueDateDayOfMonth);
                }
                
                const paymentForNextCycleExists = currentPayments.some(p => {
                    const pDate = new Date(p.date);
                    return p.memberId === member.id && pDate.getFullYear() === nextDueDate.getFullYear() && pDate.getMonth() === nextDueDate.getMonth();
                });

                if (!paymentForNextCycleExists && nextDueDate <= today) {
                    const newStatus = nextDueDate < today ? PaymentStatus.Overdue : PaymentStatus.Pending;
                    newPaymentsToGenerate.push({
                        id: `pay-auto-${Date.now()}-${member.id}-${newPaymentsToGenerate.length}`,
                        memberId: member.id,
                        planId: plan.id,
                        description: `Cobrança recorrente - ${plan.name}`,
                        amount: plan.price,
                        date: new Date(nextDueDate),
                        status: newStatus,
                    });
                }
            }
        });
        
        if (statusesUpdatedCount > 0 || newPaymentsToGenerate.length > 0) {
            setPayments(prev => [...prev.map(p => {
                if (p.status === PaymentStatus.Pending && new Date(p.date) < today) {
                    return { ...p, status: PaymentStatus.Overdue };
                }
                return p;
            }), ...newPaymentsToGenerate].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        
        if (newPaymentsToGenerate.length > 0) {
            addToast(`${newPaymentsToGenerate.length} nova(s) cobrança(s) gerada(s) automaticamente.`, 'success');
        } else if (statusesUpdatedCount > 0) {
            addToast(`${statusesUpdatedCount} pagamento(s) foram atualizados para "Vencido".`, 'info');
        }
    };

    const getSystemNotifications = (billingRulerSettings: any): { title: string, message: string }[] => {
        const notifications: { title: string, message: string }[] = [];
        const notifiedPaymentIds = new Set<string>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkAndAdd = (payment: Payment, title: string, message: string) => {
            if (!notifiedPaymentIds.has(payment.id)) {
                notifications.push({ title, message });
                notifiedPaymentIds.add(payment.id);
            }
        }
        
        if (billingRulerSettings.reminderBeforeDue.enabled) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + billingRulerSettings.reminderBeforeDue.days);
            payments.forEach(p => {
                const dueDate = new Date(p.date);
                if (p.status === PaymentStatus.Pending && dueDate.toDateString() === targetDate.toDateString()) {
                    const member = members.find(m => m.id === p.memberId);
                    checkAndAdd(p, 'Lembrete de Vencimento', `O pagamento de ${member?.name || 'um aluno'} vence em ${billingRulerSettings.reminderBeforeDue.days} dias.`);
                }
            });
        }
        
        if (billingRulerSettings.reminderOnDue.enabled) {
            payments.forEach(p => {
                if (p.status === PaymentStatus.Pending && new Date(p.date).toDateString() === today.toDateString()) {
                    const member = members.find(m => m.id === p.memberId);
                    checkAndAdd(p, 'Pagamento Vence Hoje', `O pagamento de ${member?.name || 'um aluno'} vence hoje.`);
                }
            });
        }

        if (billingRulerSettings.reminderAfterDue.enabled) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - billingRulerSettings.reminderAfterDue.days);
            payments.forEach(p => {
                if (p.status === PaymentStatus.Overdue && new Date(p.date).toDateString() === targetDate.toDateString()) {
                    const member = members.find(m => m.id === p.memberId);
                    checkAndAdd(p, 'Pagamento Atrasado', `O pagamento de ${member?.name || 'um aluno'} está atrasado há ${billingRulerSettings.reminderAfterDue.days} dias.`);
                }
            });
        }
        
        return notifications;
    };


    const value = {
        isLoading, members, plans, payments, expenses, auditLogs,
        announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
        markAnnouncementAsRead, markAllAnnouncementsAsRead,
        isAuthenticated, currentUser, isAuthenticatedMember, currentMember,
        roles, users, hasPermission,
        login, logout, loginMember, updateCurrentMemberProfile,
        requestPasswordResetForMember, resetMemberPassword,
        addRole, updateRole, deleteRole,
        addUser, updateUser, deleteUser,
        addMember, updateMember, deleteMember,
        addPlan, updatePlan, deletePlan,
        addPayment, updatePayment, deletePayment,
        addExpense, updateExpense, deleteExpense,
        importData, runAutomatedBillingCycle,
        getAIResponse, getDashboardInsights, getReportInsights, getMemberInsights,
        generatePaymentReminderMessage, generateReengagementMessage,
        getSystemNotifications, addAuditLog,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
