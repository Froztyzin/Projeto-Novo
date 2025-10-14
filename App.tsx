import React from 'react';
import { HashRouter } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { AppRouter } from './components/router/AppRouter';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AppProvider>
                    <SettingsProvider>
                        <NotificationProvider>
                            <HashRouter>
                                <AppRouter />
                            </HashRouter>
                        </NotificationProvider>
                    </SettingsProvider>
                </AppProvider>
                <ToastContainer />
            </ToastProvider>
        </ErrorBoundary>
    );
};

export default App;