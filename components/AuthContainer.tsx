
import React from 'react';
import { DumbbellIcon } from './ui/Icons';

interface AuthContainerProps {
    children: React.ReactNode;
}

const Logo: React.FC = () => (
    <div className="flex items-center justify-center space-x-4">
        <div className="p-3 bg-slate-800 rounded-lg">
            <DumbbellIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Elitte Corpus
            </span>{' '}
            Academia
        </h1>
    </div>
);

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="mb-8">
                   <Logo />
                </div>
                <div className="p-px rounded-2xl bg-gradient-to-b from-slate-700 to-transparent">
                    <div className="bg-slate-900 rounded-[15px] p-8 shadow-2xl space-y-6">
                       {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
