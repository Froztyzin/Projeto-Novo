
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Member, Plan, Payment, Expense, Role, User, AuditLog } from '../types';
import { MemberStatus, PaymentStatus, ExpenseCategory, ExpenseStatus, Permission, LogActionType } from '../types';
import { useToast } from './ToastContext';
import { GoogleGenAI } from '@google/genai';
import { generateColorPalette } from '../utils';

// --- Initial Data Setup ---
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

export interface BillingRulerSettings {
  reminderBeforeDue: { enabled: boolean; days: number };
  reminderOnDue: { enabled: boolean };
  reminderAfterDue: { enabled: boolean; days: number };
}


// --- Context Definition ---
interface AppContextType {
  isLoading: boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  isAuthenticatedMember: boolean;
  currentMember: Member | null;
  members: Member[];
  plans: Plan[];
  payments: Payment[];
  expenses: Expense[];
  roles: Role[];
  users: User[];
  auditLogs: AuditLog[];
  currentUserRole: string;
  hasPermission: (permission: Permission) => boolean;
  logo: string | null;
  primaryColor: string;
  billingRulerSettings: BillingRulerSettings;
  updateLogo: (logo: string | null) => void;
  updatePrimaryColor: (color: string) => void;
  updateBillingRulerSettings: (settings: BillingRulerSettings) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loginMember: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateCurrentMemberProfile: (data: { email?: string, telefone?: string }) => void;
  requestPasswordResetForMember: (email: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resetMemberPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
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
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (updatedRole: Role) => void;
  deleteRole: (roleId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  importData: (data: { members: Member[], plans: Plan[], payments: Payment[], expenses: Expense[] }) => void;
  manuallyTriggerBilling: () => void;
  getAIResponse: (prompt: string) => Promise<string>;
  getDashboardInsights: (periodData: any) => Promise<string>;
  getReportInsights: (reportData: any) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticatedMember, setIsAuthenticatedMember] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  // Data states
  const [plans, setPlans] = useState<Plan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // RBAC & Audit states
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  // Customization states
  const [logo, setLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [billingRulerSettings, setBillingRulerSettings] = useState<BillingRulerSettings>({
    reminderBeforeDue: { enabled: true, days: 3 },
    reminderOnDue: { enabled: true },
    reminderAfterDue: { enabled: false, days: 5 },
  });
  
  // --- Audit Log Helper ---
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

  useEffect(() => {
    const checkAuthStatus = () => {
        const storedUserId = localStorage.getItem('currentUserId');
        const storedMemberId = localStorage.getItem('currentMemberId');

        if (storedUserId) {
            const user = initialUsers.find(u => u.id === storedUserId);
            if (user) {
                setIsAuthenticated(true);
                setCurrentUser(user);
                setCurrentUserRole(user.roleId);
            }
        } else if (storedMemberId) {
             const member = initialMembers.find(m => m.id === storedMemberId);
             if (member) {
                setIsAuthenticatedMember(true);
                setCurrentMember(member);
             }
        }
        setIsAuthLoading(false);
    };

    const loadCustomization = () => {
      const storedLogo = localStorage.getItem('customLogo');
      const storedColor = localStorage.getItem('primaryColor');
      const storedBillingSettings = localStorage.getItem('billingRulerSettings');

      if (storedLogo) setLogo(storedLogo);
      if (storedColor) setPrimaryColor(storedColor);
      if (storedBillingSettings) setBillingRulerSettings(JSON.parse(storedBillingSettings));
    };

    const loadInitialData = () => {
        const plansData = initialPlans;
        const membersData = initialMembers;
        let paymentsData = generateInitialPayments(membersData, plansData);
        const expensesData = initialExpenses;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        paymentsData = paymentsData.map(p => {
            if (p.status === PaymentStatus.Pending && new Date(p.date) < today) {
                return { ...p, status: PaymentStatus.Overdue };
            }
            return p;
        });

        setPlans(plansData);
        setMembers(membersData);
        setPayments(paymentsData);
        setExpenses(expensesData);
        setIsLoading(false);
    }
    
    checkAuthStatus();
    loadCustomization();
    const timer = setTimeout(loadInitialData, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const palette = generateColorPalette(primaryColor);
    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId);

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    
    const cssVariables = Object.entries(palette)
        .map(([shade, rgbString]) => `--color-primary-${shade}: ${rgbString};`)
        .join('\n');
    
    styleTag.innerHTML = `:root { ${cssVariables} }`;
  }, [primaryColor]);
  
  // --- Auth Functions ---
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setCurrentUserRole(user.roleId);
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
      setCurrentUserRole('');
      localStorage.removeItem('currentUserId');
      
      setIsAuthenticatedMember(false);
      setCurrentMember(null);
      localStorage.removeItem('currentMemberId');

      addToast('Você saiu com sucesso.', 'info');
  };
  
  const requestPasswordResetForMember = async (email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    const memberIndex = members.findIndex(m => m.email === email);
    
    if (memberIndex === -1) {
        // To prevent user enumeration, we return a success message even if the email doesn't exist.
        // In a real app, the email sending would fail silently on the backend.
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


  // --- Permissions ---
  const hasPermission = (permission: Permission): boolean => {
      const role = roles.find(r => r.id === currentUserRole);
      return role?.permissions.includes(permission) ?? false;
  };

  // --- Customization Functions ---
  const updateLogo = (newLogo: string | null) => {
    if (newLogo) {
      localStorage.setItem('customLogo', newLogo);
      setLogo(newLogo);
    } else {
      localStorage.removeItem('customLogo');
      setLogo(null);
    }
     addAuditLog(LogActionType.UPDATE_SETTINGS, 'Atualizou o logo da academia.');
  }

  const updatePrimaryColor = (newColor: string) => {
      localStorage.setItem('primaryColor', newColor);
      setPrimaryColor(newColor);
      addAuditLog(LogActionType.UPDATE_SETTINGS, `Alterou a cor primária para ${newColor}.`);
  }
  
  const updateBillingRulerSettings = (settings: BillingRulerSettings) => {
    localStorage.setItem('billingRulerSettings', JSON.stringify(settings));
    setBillingRulerSettings(settings);
    addAuditLog(LogActionType.UPDATE_SETTINGS, 'Atualizou as configurações da régua de cobrança.');
  };


  // --- Gemini AI ---
  const getAIResponse = async (prompt: string): Promise<string> => {
    try {
      if (!process.env.API_KEY) {
        return "A chave da API do Gemini não foi configurada. Verifique as variáveis de ambiente.";
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const dataContext = {
        alunos: members.map(m => ({ ...m, plano: plans.find(p => p.id === m.planId)?.name || 'N/A' })),
        planos: plans,
        pagamentos: payments.map(p => ({ ...p, aluno: members.find(m => m.id === p.memberId)?.name || 'N/A' })),
        despesas: expenses,
        data_atual: new Date().toLocaleDateString('pt-BR')
      };

      const systemInstruction = `Você é um assistente de IA e especialista em gestão de academias para o sistema Ellite Corpus. Sua missão é fornecer insights e respostas precisas, baseadas *estritamente* nos dados fornecidos.

**DIRETRIZES DE RESPOSTA:**

1.  **Persona de Especialista:** Aja como um analista de negócios experiente. Suas respostas devem ser profissionais, claras e focadas em ajudar o gestor da academia.
2.  **Formatação com Markdown:** Utilize markdown para tornar a informação fácil de ler. Use **negrito** para destacar valores, nomes e conclusões importantes. Use listas (\`-\` ou \`1.\`) para itens e passos.
3.  **Fidelidade Absoluta aos Dados:** Todas as suas respostas devem ser derivadas *exclusivamente* do JSON de dados abaixo. Não utilize conhecimento externo ou prévio.
4.  **Proibido Inventar:** Se a resposta para uma pergunta não pode ser encontrada nos dados, afirme claramente que a informação não está disponível no contexto fornecido. Exemplo: "Com base nos dados atuais, não consigo determinar essa informação."
5.  **Capacidade de Análise:** Você pode e deve realizar cálculos (somas, médias, contagens, etc.) a partir dos dados para responder a perguntas como "Qual foi a receita total em Março?" ou "Quantos alunos estão com pagamentos pendentes?".
6.  **Idioma:** Responda sempre em português do Brasil.

A seguir, os dados atuais da academia para sua análise:

// DADOS DA ACADEMIA (em formato JSON)
${JSON.stringify(dataContext, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error);
      addToast('Ocorreu um erro ao contatar o assistente de IA.', 'error');
      return "Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.";
    }
  };
  
  const getDashboardInsights = async (periodData: any): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            return "A chave da API do Gemini não foi configurada para gerar insights.";
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const systemInstruction = `Você é um analista de negócios sênior para o sistema de gestão de academias Ellite Corpus.
        Sua tarefa é analisar os dados do painel de um determinado período e fornecer um resumo conciso e acionável para o gestor da academia.

        **REGRAS:**
        1.  **Seja Breve e Impactante:** Forneça a análise em um único parágrafo.
        2.  **Identifique a Tendência Principal:** Comece declarando a tendência mais importante (ex: "Sua receita aumentou significativamente...", "Houve uma queda no número de novos alunos...").
        3.  **Destaque os Fatores:** Mencione os principais fatores que contribuíram para essa tendência (ex: "...impulsionada por novas inscrições no Plano X."). Use **negrito** para destacar números e tendências chave.
        4.  **Aponte um Ponto de Atenção:** Identifique uma métrica que precisa de atenção (ex: "Apesar do crescimento, o número de pagamentos vencidos também aumentou.").
        5.  **Forneça uma Sugestão Acionável:** Termine com uma sugestão clara, simples e prática que o gestor possa implementar. (ex: "Sugestão: Crie uma campanha de reativação para alunos inativos.").
        6.  **Baseie-se nos Dados:** Use apenas os dados fornecidos. Não invente informações.
        7.  **Linguagem**: Responda em português do Brasil.

        // DADOS DO PERÍODO ANALISADO (em formato JSON)
        ${JSON.stringify(periodData, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Gere a análise do painel com base nos dados fornecidos.",
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Erro ao gerar insights do dashboard:", error);
        addToast('Ocorreu um erro ao gerar a análise da IA.', 'error');
        return "Não foi possível gerar a análise no momento. Verifique sua conexão ou tente novamente mais tarde.";
    }
};

 const getReportInsights = async (reportData: any): Promise<string> => {
    try {
      if (!process.env.API_KEY) {
        return "A chave da API do Gemini não está configurada para gerar insights do relatório.";
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const systemInstruction = `Você é um analista financeiro especializado em academias, trabalhando com o sistema Ellite Corpus.
      Sua tarefa é analisar os dados de um relatório de pagamentos filtrado e gerar um insight acionável para o gestor.

      **REGRAS:**
      1.  **Análise Focada:** Concentre-se nos dados do relatório fornecido. Não use dados históricos ou informações externas.
      2.  **Estrutura da Resposta:** Forneça a análise em um parágrafo único e conciso.
      3.  **Destaque os Pontos-Chave:** Comece identificando a observação mais crítica (ex: "O relatório mostra um número elevado de pagamentos vencidos...", "A maior parte da receita veio do Plano X..."). Use **negrito** para destacar valores, nomes de planos e status.
      4.  **Conecte os Dados:** Relacione diferentes pontos de dados, se possível (ex: "...onde o **Plano Pro Trimestral** contribui com **R$ XXXX** do total, mas também tem a maior quantidade de pagamentos **Vencidos**.").
      5.  **Sugestão Prática:** Termine com uma sugestão clara e direcionada. A sugestão deve ser diretamente baseada na análise (ex: "Sugestão: Crie uma régua de cobrança via WhatsApp para os alunos com pagamentos vencidos há mais de 15 dias.").
      6.  **Linguagem**: Responda em português do Brasil.

      // DADOS DO RELATÓRIO (em formato JSON)
      ${JSON.stringify(reportData, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Gere a análise do relatório financeiro com base nos dados fornecidos.",
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("Erro ao gerar insights do relatório:", error);
      addToast('Ocorreu um erro ao gerar a análise do relatório.', 'error');
      return "Não foi possível gerar a análise no momento. Tente novamente mais tarde.";
    }
  };

  // --- Billing Automation ---
  const manuallyTriggerBilling = () => {
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
        
        const lastPayment = memberPayments[0];
        if (!lastPayment) return;

        let nextDueDate = new Date(lastPayment.date);
        nextDueDate.setMonth(nextDueDate.getMonth() + plan.durationInMonths);

        if (plan.dueDateDayOfMonth) {
            nextDueDate.setDate(plan.dueDateDayOfMonth);
        }
        
        if (nextDueDate <= today) {
            const paymentForNextCycleExists = memberPayments.some(p => {
                const pDate = new Date(p.date);
                return pDate.getFullYear() === nextDueDate.getFullYear() && pDate.getMonth() === nextDueDate.getMonth();
            });

            if (!paymentForNextCycleExists) {
                const newStatus = nextDueDate < today ? PaymentStatus.Overdue : PaymentStatus.Pending;
                newPaymentsToGenerate.push({
                    id: `pay-auto-${Date.now()}-${member.id}`,
                    memberId: member.id,
                    planId: plan.id,
                    description: `Cobrança recorrente - ${plan.name}`,
                    amount: plan.price,
                    date: nextDueDate,
                    status: newStatus,
                });
            }
        }
    });
    
    if (statusesUpdatedCount > 0 || newPaymentsToGenerate.length > 0) {
        setPayments([...currentPayments, ...newPaymentsToGenerate].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    
    if (newPaymentsToGenerate.length > 0) {
        addToast(`${newPaymentsToGenerate.length} nova(s) cobrança(s) gerada(s).`, 'success');
    } else if (statusesUpdatedCount > 0) {
        addToast(`${statusesUpdatedCount} pagamento(s) foram atualizados para "Vencido".`, 'info');
    } else {
        addToast('Nenhuma nova cobrança ou atualização de status necessária.', 'info');
    }
  };

  // --- CRUD Functions ---
  const updateCurrentMemberProfile = (data: { email?: string; telefone?: string }) => {
    if (!currentMember) return;
    const updatedMember = { ...currentMember, ...data };
    setCurrentMember(updatedMember);
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addToast('Perfil atualizado com sucesso!', 'success');
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
    // FIX: Find member before deleting to get their name for the audit log.
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
    // FIX: Find plan before deleting to get its name for the audit log.
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
    setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    addToast('Despesa adicionada com sucesso!', 'success');
    addAuditLog(LogActionType.CREATE_EXPENSE, `Adicionou a despesa "${newExpense.description}".`);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a, b) => b.date.getTime() - a.date.getTime()));
    addToast('Despesa atualizada com sucesso!', 'success');
    addAuditLog(LogActionType.UPDATE_EXPENSE, `Atualizou a despesa "${updatedExpense.description}".`);
  };

  const deleteExpense = (expenseId: string) => {
    // FIX: Find expense before deleting to get its description for the audit log.
    const expenseToDelete = expenses.find(e => e.id === expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    addToast('Despesa excluída com sucesso!', 'success');
    if (expenseToDelete) {
      addAuditLog(LogActionType.DELETE_EXPENSE, `Excluiu a despesa "${expenseToDelete.description}".`);
    }
  };

  const addRole = (role: Omit<Role, 'id'>) => {
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
      // FIX: Find role before deleting to get its name for the audit log.
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
      // FIX: Find user before deleting to get their name for the audit log.
      const userToDelete = users.find(u => u.id === userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      addToast('Usuário excluído com sucesso!', 'success');
      if (userToDelete) {
        addAuditLog(LogActionType.DELETE_USER, `Excluiu o usuário "${userToDelete.name}".`);
      }
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


  const value = {
    isLoading, isAuthLoading, isAuthenticated, currentUser,
    isAuthenticatedMember, currentMember,
    members, plans, payments, expenses, roles, users, auditLogs, currentUserRole, hasPermission,
    logo, primaryColor, billingRulerSettings,
    updateLogo, updatePrimaryColor, updateBillingRulerSettings,
    login, logout, loginMember, updateCurrentMemberProfile,
    requestPasswordResetForMember, resetMemberPassword,
    addMember, updateMember, deleteMember,
    addPlan, updatePlan, deletePlan,
    addPayment, updatePayment, deletePayment,
    addExpense, updateExpense, deleteExpense,
    addRole, updateRole, deleteRole,
    addUser, updateUser, deleteUser,
    importData,
    manuallyTriggerBilling,
    getAIResponse,
    getDashboardInsights,
    getReportInsights,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook ---
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};