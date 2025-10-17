
import React, { useState, useMemo } from 'react';
import type { Member, Plan, Payment } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { LogOutIcon, UserCircleIcon, CreditCardIcon, PackageIcon, DumbbellIcon, BellIcon } from './ui/Icons';
import { MemberStatus, PaymentStatus } from '../types';
import { MemberStatusBadge, PaymentStatusBadge } from './ui/Badges';
import { Button } from './ui/Button';
import { applyPhoneMask, markdownToHtml } from '../utils';
import { PaymentMethodModal } from './PaymentMethodModal';

type MemberView = 'plan' | 'payments' | 'profile' | 'announcements';

const MemberHeader: React.FC<{ member: Member, onLogout: () => void, logo: string | null }> = ({ member, onLogout, logo }) => (
    <header className="bg-slate-900 shadow-md border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                 {logo ? (
                    <img src={logo} alt="Logo" className="max-h-10 w-auto" />
                    ) : (
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <DumbbellIcon className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-100">
                            Elitte Corpus
                        </h1>
                    </div>
                )}
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="font-semibold text-slate-100">{member.name}</p>
                        <p className="text-sm text-slate-400">Aluno(a)</p>
                    </div>
                    <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Sair">
                        <LogOutIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const MemberNav: React.FC<{ view: MemberView, setView: (view: MemberView) => void }> = ({ view, setView }) => {
    const { announcements, currentMember } = useAppContext();

    const unreadCount = useMemo(() => {
        if (!currentMember) return 0;
        return announcements.filter(a => !a.readByMemberIds.includes(currentMember.id)).length;
    }, [announcements, currentMember]);

    const navItems = [
        { id: 'plan', label: 'Meu Plano', icon: <PackageIcon className="h-5 w-5 mr-2" /> },
        { id: 'payments', label: 'Pagamentos', icon: <CreditCardIcon className="h-5 w-5 mr-2" /> },
        { id: 'announcements', label: 'Avisos', icon: <BellIcon className="h-5 w-5 mr-2" />, notificationCount: unreadCount },
        { id: 'profile', label: 'Meu Perfil', icon: <UserCircleIcon className="h-5 w-5 mr-2" /> },
    ];
    return (
        <nav className="flex justify-center space-x-2 sm:space-x-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id as MemberView)}
                    className={`relative flex items-center px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-semibold rounded-md transition-colors w-full justify-center ${
                        view === item.id
                            ? 'bg-slate-800 text-purple-400 shadow'
                            : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.notificationCount && item.notificationCount > 0 ? (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-slate-900">
                            {item.notificationCount > 9 ? '9+' : item.notificationCount}
                        </span>
                    ) : null}
                </button>
            ))}
        </nav>
    );
};

const MemberPlan: React.FC<{ member: Member, plan: Plan | null, payments: Payment[] }> = ({ member, plan, payments }) => {
    const expiryDate = useMemo(() => {
        if (!plan || member.status !== MemberStatus.Active) return null;
        
        const lastPayment = payments
            .filter(p => p.status === PaymentStatus.Paid)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
        if (!lastPayment) return null;
        
        const expiry = new Date(lastPayment.paidDate || lastPayment.date);
        expiry.setMonth(expiry.getMonth() + plan.durationInMonths);
        return expiry;
    }, [plan, payments, member]);

    return (
        <Card className="animate-fadeIn">
            <CardHeader>
                <CardTitle>Detalhes do Plano</CardTitle>
                <CardDescription>Aqui estão as informações sobre sua assinatura atual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {plan ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
                        <div className="p-4 bg-slate-800/70 rounded-lg">
                            <p className="text-sm font-medium text-slate-400">Plano Atual</p>
                            <p className="text-xl font-bold text-purple-400">{plan.name}</p>
                        </div>
                         <div className="p-4 bg-slate-800/70 rounded-lg">
                            <p className="text-sm font-medium text-slate-400">Valor</p>
                            <p className="text-xl font-bold text-slate-100">{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="p-4 bg-slate-800/70 rounded-lg">
                            <p className="text-sm font-medium text-slate-400">Status da Assinatura</p>
                            <MemberStatusBadge status={member.status} />
                        </div>
                        {expiryDate && (
                            <div className="p-4 bg-slate-800/70 rounded-lg">
                                <p className="text-sm font-medium text-slate-400">Expira em</p>
                                <p className="text-xl font-bold text-slate-100">{expiryDate.toLocaleDateString('pt-BR')}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-8">Você não possui um plano ativo no momento.</p>
                )}
            </CardContent>
        </Card>
    );
};

const MemberPayments: React.FC<{ payments: Payment[], plans: Plan[], updatePayment: (payment: Payment) => void }> = ({ payments, plans, updatePayment }) => {
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const handleConfirmPayment = () => {
        if (selectedPayment) {
            updatePayment({
                ...selectedPayment,
                status: PaymentStatus.Paid,
                paidDate: new Date(),
            });
            setSelectedPayment(null);
        }
    };
    
    return (
        <>
            <Card className="animate-fadeIn">
                <CardHeader>
                    <CardTitle>Histórico de Pagamentos</CardTitle>
                    <CardDescription>Acompanhe e realize seus pagamentos.</CardDescription>
                </CardHeader>
                <CardContent>
                    {payments.length > 0 ? (
                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {payments.map(p => (
                                <li key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-800/70 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-100">{plans.find(pl => pl.id === p.planId)?.name || p.description || 'Pagamento'}</p>
                                        <p className="text-sm text-slate-400">Vencimento: {new Date(p.date).toLocaleDateString('pt-BR')}</p>
                                        {p.paidDate && <p className="text-sm text-primary-400">Pago em: {new Date(p.paidDate).toLocaleDateString('pt-BR')}</p>}
                                    </div>
                                    <div className="flex items-center mt-2 sm:mt-0">
                                        <p className="font-bold text-lg text-slate-100 mr-4">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        <PaymentStatusBadge status={p.status} />
                                        {(p.status === PaymentStatus.Pending || p.status === PaymentStatus.Overdue) && (
                                            <Button 
                                                size="sm" 
                                                className="ml-4"
                                                onClick={() => setSelectedPayment(p)}
                                            >
                                                Pagar Agora
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-400 py-8">Nenhum pagamento encontrado.</p>
                    )}
                </CardContent>
            </Card>
            {selectedPayment && (
                <PaymentMethodModal
                    isOpen={!!selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onConfirm={handleConfirmPayment}
                    payment={selectedPayment}
                />
            )}
        </>
    );
};

const MemberProfile: React.FC<{ member: Member }> = ({ member }) => {
    const { updateCurrentMemberProfile } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: member.email,
        telefone: member.telefone || '',
    });

    const handleSave = () => {
        updateCurrentMemberProfile({
            email: formData.email,
            telefone: formData.telefone
        });
        setIsEditing(false);
    };

    return (
        <Card className="animate-fadeIn">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Meu Perfil</CardTitle>
                        <CardDescription>Visualize e edite suas informações de contato.</CardDescription>
                    </div>
                    {!isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}>Editar</Button>}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-400">Nome Completo</label>
                    <p className="text-lg text-slate-100 p-2 bg-slate-800/70 rounded-md">{member.name}</p>
                </div>
                 <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-400">E-mail</label>
                    <input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} disabled={!isEditing} className={`w-full text-lg p-2 rounded-md ${isEditing ? 'bg-slate-800 border border-slate-700' : 'bg-slate-800/70 border-transparent'}`} />
                </div>
                 <div>
                    <label htmlFor="telefone" className="text-sm font-medium text-slate-400">Telefone</label>
                    <input id="telefone" type="tel" value={formData.telefone} onChange={e => setFormData(p => ({...p, telefone: applyPhoneMask(e.target.value)}))} disabled={!isEditing} className={`w-full text-lg p-2 rounded-md ${isEditing ? 'bg-slate-800 border border-slate-700' : 'bg-slate-800/70 border-transparent'}`} />
                </div>
                {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={() => { setIsEditing(false); setFormData({ email: member.email, telefone: member.telefone || '' }); }}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Alterações</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const MemberAnnouncements: React.FC = () => {
    const { announcements, currentMember, markAnnouncementAsRead, markAllAnnouncementsAsRead } = useAppContext();

    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [announcements]);

    const unreadCount = useMemo(() => {
        if (!currentMember) return 0;
        return announcements.filter(a => !a.readByMemberIds.includes(currentMember.id)).length;
    }, [announcements, currentMember]);

    if (!currentMember) return null;

    return (
        <Card className="animate-fadeIn">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Mural de Avisos</CardTitle>
                        <CardDescription>Fique por dentro das últimas novidades da academia.</CardDescription>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAnnouncementsAsRead}>
                            Marcar todos como lidos
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {sortedAnnouncements.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {sortedAnnouncements.map(ann => {
                            const isRead = ann.readByMemberIds.includes(currentMember.id);
                            return (
                                <div key={ann.id} className={`p-4 bg-slate-800/70 rounded-lg transition-opacity ${isRead ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-lg text-slate-100 flex items-center">
                                            {!isRead && <span className="h-2 w-2 bg-purple-400 rounded-full mr-3 flex-shrink-0"></span>}
                                            {ann.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 ml-2 text-right">{new Date(ann.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mt-1">{ann.type}</p>
                                    <div 
                                        className="mt-3 text-slate-300 ai-content"
                                        dangerouslySetInnerHTML={{ __html: markdownToHtml(ann.content) }}
                                    ></div>
                                    {!isRead && (
                                        <div className="text-right mt-3">
                                            <Button size="sm" variant="ghost" onClick={() => markAnnouncementAsRead(ann.id)}>
                                                Marcar como lido
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-8">Nenhum aviso publicado no momento.</p>
                )}
            </CardContent>
        </Card>
    );
};

export const MemberPortal: React.FC = () => {
    const [view, setView] = useState<MemberView>('announcements');
    const { currentMember, logout, plans, payments, updatePayment } = useAppContext();
    const { logo } = useSettings();

    if (!currentMember) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
                <p>Nenhum aluno logado.</p>
            </div>
        );
    }
    
    const memberPlan = plans.find(p => p.id === currentMember.planId) || null;
    const memberPayments = payments.filter(p => p.memberId === currentMember.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const renderView = () => {
        switch (view) {
            case 'plan': return <MemberPlan member={currentMember} plan={memberPlan} payments={memberPayments} />;
            case 'payments': return <MemberPayments payments={memberPayments} plans={plans} updatePayment={updatePayment} />;
            case 'announcements': return <MemberAnnouncements />;
            case 'profile': return <MemberProfile member={currentMember} />;
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
            <MemberHeader member={currentMember} onLogout={logout} logo={logo} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <MemberNav view={view} setView={setView} />
                    {renderView()}
                </div>
            </main>
        </div>
    );
};
