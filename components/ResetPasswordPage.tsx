import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { AuthContainer } from './AuthContainer';

export const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { resetMemberPassword } = useAppContext();
    const { addToast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Token de redefinição ausente. Por favor, solicite um novo link.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setIsLoading(true);
        const result = await resetMemberPassword(token, password);
        setIsLoading(false);

        if (result.success) {
            addToast(result.message, 'success');
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
         <AuthContainer>
             <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100">Crie sua Nova Senha</h2>
                <p className="mt-2 text-slate-400">Escolha uma senha segura com 6 ou mais caracteres.</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">Nova Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-slate-700 bg-slate-800 py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password"className="block text-sm font-semibold text-slate-300 mb-2">Confirmar Nova Senha</label>
                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full rounded-md border-slate-700 bg-slate-800 py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 p-4 rounded-md text-sm mt-4">
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <Button type="submit" className="w-full !py-3 !text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" isLoading={isLoading}>
                        Salvar Nova Senha
                    </Button>
                </div>
            </form>

             <div className="mt-8 text-center text-sm">
                <button onClick={() => navigate('/login')} className="font-medium text-purple-400 hover:text-purple-300">
                    Voltar para o Login
                </button>
            </div>
        </AuthContainer>
    );
};
