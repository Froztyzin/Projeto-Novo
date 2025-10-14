import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { ProtectedMemberRoute } from './ProtectedMemberRoute';
import { Layout } from './Layout';
import { CombinedLoginPage } from '../CombinedLoginPage';
import { RequestPasswordResetPage } from '../RequestPasswordResetPage';
import { ResetPasswordPage } from '../ResetPasswordPage';
import { MemberPortal } from '../MemberPortal';

import { Dashboard } from '../Dashboard';
import { MembersList } from '../MembersList';
import { PlansList } from '../PlansList';
import { PaymentsList } from '../PaymentsList';
import { ExpensesList } from '../ExpensesList';
import { Reports } from '../Reports';
import { CalendarView } from '../CalendarView';
import { Settings } from '../Settings';
import { UsersList } from '../UsersList';
import { AuditLogList } from '../AuditLogList';

export const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<CombinedLoginPage />} />
            <Route path="/request-reset" element={<RequestPasswordResetPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Rota do Portal do Aluno */}
            <Route element={<ProtectedMemberRoute />}>
                <Route path="/portal" element={<MemberPortal />} />
            </Route>

            {/* Rotas Administrativas Protegidas */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="members" element={<MembersList />} />
                    <Route path="plans" element={<PlansList />} />
                    <Route path="payments" element={<PaymentsList />} />
                    <Route path="expenses" element={<ExpensesList />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="users" element={<UsersList />} />
                    <Route path="audit-log" element={<AuditLogList />} />
                </Route>
            </Route>
            
            {/* Rota de fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};
