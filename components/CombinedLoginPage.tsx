import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/Button';
import type { AuthView } from '../types';
import { AuthContainer } from './AuthContainer';
import { ShieldCheckIcon, GraduationCapIcon } from './ui/Icons';

interface CombinedLoginPageProps {
    setAuthView: (view: AuthView) => void;
}

type LoginMode = 'admin' | 'member';

export const CombinedLoginPage: React.FC<CombinedLoginPageProps> = ({ setAuthView }) => {
    const { login, loginMember } = useAppContext();
    const [mode, setMode] = useState<LoginMode>('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleModeChange = (newMode: LoginMode) => {
        setMode(newMode);
        setEmail('');
        setPassword('');
        setError('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const result = mode === 'admin' 
            ? await login(email, password)
            : await loginMember(email, password);

        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'Ocorreu um erro desconhecido.');
        }
    };

    const config = {
        admin: {
            title: 'Área Administrativa',
            subtitle: 'Acesso para funcionários e administradores',
            emailPlaceholder: 'admin@academia.com',
            buttonText: 'Acessar Sistema',
        },
        member: {
            title: 'Portal do Aluno',
            subtitle: 'Acesse seu plano, pagamentos e perfil',
            emailPlaceholder: 'seuemail@exemplo.com',
            buttonText: 'Entrar',
        }
    }
    
    const currentConfig = config[mode];

    return (
        <AuthContainer>
             <p className="text-center text-slate-400">Faça login para acessar sua área</p>
             
             <div className="p-1 bg-slate-800 rounded-lg grid grid-cols-2 gap-1">
                <button
                    onClick={() => handleModeChange('admin')}
                    className={`flex items-center justify-center space-x-2 w-full text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${mode === 'admin' ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Administração</span>
                </button>
                <button
                    onClick={() => handleModeChange('member')}
                    className={`flex items-center justify-center space-x-2 w-full text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${mode === 'member' ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    <GraduationCapIcon className="h-5 w-5" />
                    <span>Portal do Aluno</span>
                </button>
             </div>
             
             <div className="text-center">
                 <h2 className="text-2xl font-bold text-slate-100">{currentConfig.title}</h2>
                 <p className="mt-1 text-slate-400">{currentConfig.subtitle}</p>
             </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border-slate-700 bg-slate-800 py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder={currentConfig.emailPlaceholder}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                           <label htmlFor="password"className="block text-sm font-semibold text-slate-300">Senha</label>
                           {mode === 'member' && (
                                <button 
                                    type="button" 
                                    onClick={() => setAuthView('requestReset')} 
                                    className="text-xs font-medium text-purple-400 hover:text-purple-300"
                                >
                                    Esqueceu sua senha?
                                </button>
                           )}
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-slate-700 bg-slate-800 py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="Sua senha"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 p-4 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <Button type="submit" className="w-full !py-3 !text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" isLoading={isLoading}>
                        {currentConfig.buttonText}
                    </Button>
                </div>
            </form>
        </AuthContainer>
    );
};