import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

export const ProtectedMemberRoute: React.FC = () => {
    const { isAuthenticatedMember, isLoading } = useAppContext();

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return isAuthenticatedMember ? <Outlet /> : <Navigate to="/login" replace />;
};
