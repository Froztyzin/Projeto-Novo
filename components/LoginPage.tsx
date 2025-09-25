import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/Button';

export const LoginPage: React.FC = () => {
    const { login } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'Ocorreu um erro desconhecido.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">Ellite Corpus</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Faça login para gerenciar sua academia</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-slate-700 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="E-mail"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-slate-700 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Senha"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Entrar
                        </Button>
                    </div>
                </form>
                 <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p className="font-bold">Usuários de Teste:</p>
                    <p>admin@elite.com</p>
                    <p>gerente@elite.com</p>
                    <p>staff@elite.com</p>
                    <p className="mt-2">Senha para todos: <span className="font-mono bg-gray-200 dark:bg-slate-700 p-1 rounded">password</span></p>
                </div>
            </div>
        </div>
    );
};