import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import type { AuthView } from '../types';
import { AuthContainer } from './AuthContainer';

interface RequestPasswordResetPageProps {
    setAuthView: (view: AuthView) => void;
    setResetToken: (token: string) => void;
}

export const RequestPasswordResetPage: React.FC<RequestPasswordResetPageProps> = ({ setAuthView, setResetToken }) => {
    const { requestPasswordResetForMember } = useAppContext();
    const { addToast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await requestPasswordResetForMember(email);
        setIsLoading(false);

        if (result.success) {
            addToast(result.message, 'success');
            if (result.token) {
                 setTimeout(() => {
                    setResetToken(result.token!);
                    setAuthView('resetPassword');
                }, 1000); 
            } else {
                 setIsSubmitted(true);
            }
        } else {
            addToast(result.message, 'error');
        }
    };

    return (
        <AuthContainer>
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-slate-100">Redefinir Senha</h2>
                <p className="mt-2 text-slate-400">
                    {isSubmitted
                        ? 'Verifique sua caixa de entrada.'
                        : 'Digite seu e-mail para receber o link de redefinição.'
                    }
                </p>
            </div>
            
            {!isSubmitted ? (
                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                            placeholder="seuemail@exemplo.com"
                        />
                    </div>
                    <div>
                        <Button type="submit" className="w-full !py-3 !text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" isLoading={isLoading}>
                            Enviar Link de Redefinição
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="mt-8 text-center text-slate-300">
                    <p>Para fins de demonstração, você será redirecionado automaticamente.</p>
                </div>
            )}
            
            <div className="mt-8 text-center text-sm">
                <button onClick={() => setAuthView('adminLogin')} className="font-medium text-purple-400 hover:text-purple-300">
                    Lembrou a senha? Voltar para o Login
                </button>
            </div>
        </AuthContainer>
    );
};