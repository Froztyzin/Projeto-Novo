
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Member, Plan, Payment, Expense, Role, User } from '../types';
import { MemberStatus, PaymentStatus, ExpenseCategory, ExpenseStatus, Permission } from '../types';
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
  { id: 'mem1', name: 'Alice Johnson', email: 'alice@example.com', telefone: '(11) 98765-4321', joinDate: new Date('2023-01-15'), planId: 'plan3', status: MemberStatus.Active },
  { id: 'mem2', name: 'Bob Williams', email: 'bob@example.com', telefone: '(21) 91234-5678', joinDate: new Date('2023-03-22'), planId: 'plan1', status: MemberStatus.Active },
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

const dummyUsers: User[] = [
    { id: 'user1', email: 'admin@elite.com', password: 'password', roleId: 'role_admin' },
    { id: 'user2', email: 'gerente@elite.com', password: 'password', roleId: 'role_manager' },
    { id: 'user3', email: 'staff@elite.com', password: 'password', roleId: 'role_staff' },
];

// --- Context Definition ---
interface AppContextType {
  isLoading: boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  members: Member[];
  plans: Plan[];
  payments: Payment[];
  expenses: Expense[];
  roles: Role[];
  currentUserRole: string;
  hasPermission: (permission: Permission) => boolean;
  logo: string | null;
  primaryColor: string;
  updateLogo: (logo: string | null) => void;
  updatePrimaryColor: (color: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
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
  // Data states
  const [plans, setPlans] = useState<Plan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // RBAC states
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  // Customization states
  const [logo, setLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const checkAuthStatus = () => {
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId) {
            const user = dummyUsers.find(u => u.id === storedUserId);
            if (user) {
                setIsAuthenticated(true);
                setCurrentUser(user);
                setCurrentUserRole(user.roleId);
            }
        }
        setIsAuthLoading(false);
    };

    const loadCustomization = () => {
      const storedLogo = localStorage.getItem('customLogo');
      const storedColor = localStorage.getItem('primaryColor');
      if (storedLogo) setLogo(storedLogo);
      if (storedColor) setPrimaryColor(storedColor);
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
      const user = dummyUsers.find(u => u.email === email && u.password === password);
      if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setCurrentUserRole(user.roleId);
          localStorage.setItem('currentUserId', user.id);
          addToast(`Bem-vindo, ${user.email}!`, 'success');
          return { success: true };
      }
      return { success: false, message: 'Credenciais inválidas.' };
  };

  const logout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentUserRole('');
      localStorage.removeItem('currentUserId');
      addToast('Você saiu com sucesso.', 'info');
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
  }

  const updatePrimaryColor = (newColor: string) => {
      localStorage.setItem('primaryColor', newColor);
      setPrimaryColor(newColor);
  }

  // --- Gemini AI ---
  const getAIResponse = async (prompt: string): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };
  
  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: `mem${Date.now()}` };
    setMembers(prev => [...prev, newMember]);
    addToast('Aluno adicionado com sucesso!', 'success');
  };
  
  const updateMemberWithToast = (updatedMember: Member) => {
    updateMember(updatedMember);
    addToast('Aluno atualizado com sucesso!', 'success');
  };

  const deleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    addToast('Aluno excluído com sucesso!', 'success');
  };
  
  const addPlan = (plan: Omit<Plan, 'id'>) => {
    const newPlan = { ...plan, id: `plan${Date.now()}` };
    setPlans(prev => [...prev, newPlan]);
    addToast('Plano adicionado com sucesso!', 'success');
  };

  const updatePlan = (updatedPlan: Plan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    addToast('Plano atualizado com sucesso!', 'success');
  };
  
  const deletePlan = (planId: string) => {
     setPlans(prev => prev.filter(p => p.id !== planId));
     addToast('Plano excluído com sucesso!', 'success');
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: `pay${Date.now()}` };
    setPayments(prev => [newPayment, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const member = members.find(m => m.id === payment.memberId);
    if(member && member.status === MemberStatus.Pending && payment.status === PaymentStatus.Paid) {
        updateMember({...member, status: MemberStatus.Active});
    }
    addToast('Pagamento registrado com sucesso!', 'success');
  };

  const updatePayment = (updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    addToast('Pagamento atualizado com sucesso!', 'success');
  };

  const deletePayment = (paymentId: string) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    addToast('Pagamento excluído com sucesso!', 'success');
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `exp${Date.now()}` };
    setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    addToast('Despesa adicionada com sucesso!', 'success');
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a, b) => b.date.getTime() - a.date.getTime()));
    addToast('Despesa atualizada com sucesso!', 'success');
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    addToast('Despesa excluída com sucesso!', 'success');
  };

  const addRole = (role: Omit<Role, 'id'>) => {
      const newRole = { ...role, id: `role_${Date.now()}`, isEditable: true };
      setRoles(prev => [...prev, newRole]);
      addToast('Função adicionada com sucesso!', 'success');
  };

  const updateRole = (updatedRole: Role) => {
      setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
      addToast('Função atualizada com sucesso!', 'success');
  };

  const deleteRole = (roleId: string) => {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      addToast('Função excluída com sucesso!', 'success');
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

    } catch (error) {
        console.error("Erro ao importar dados:", error);
        addToast('Erro ao importar dados. Verifique o console.', 'error');
    }
  };


  const value = {
    isLoading, isAuthLoading, isAuthenticated, currentUser,
    members, plans, payments, expenses, roles, currentUserRole, hasPermission,
    logo, primaryColor, updateLogo, updatePrimaryColor,
    login, logout,
    addMember, updateMember: updateMemberWithToast, deleteMember,
    addPlan, updatePlan, deletePlan,
    addPayment, updatePayment, deletePayment,
    addExpense, updateExpense, deleteExpense,
    addRole, updateRole, deleteRole,
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