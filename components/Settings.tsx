import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useSettings, BillingRulerSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { Permission } from '../types';
import { Skeleton } from './ui/Skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

const SettingsSkeleton: React.FC = () => (
    <div className="space-y-8">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>
);

const ToggleSwitch = ({ id, label, checked, onChange, disabled = false }: { id: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{label}</label>
        <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in ${disabled ? 'cursor-not-allowed' : ''}`}>
            <input
                type="checkbox"
                name={id}
                id={id}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label htmlFor={id} className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-slate-600 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}></label>
        </div>
        <style>{`.toggle-checkbox:checked { right: 0; border-color: rgb(var(--color-primary-600)); } .toggle-checkbox:checked + .toggle-label { background-color: rgb(var(--color-primary-600)); } .toggle-checkbox:disabled { border-color: #9ca3af; } .toggle-checkbox:disabled + .toggle-label { background-color: #e5e7eb; } html.dark .toggle-checkbox:disabled + .toggle-label { background-color: #475569; }`}</style>
    </div>
);

const SettingsInput = ({ id, label, value, onChange, placeholder }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
        <label htmlFor={id} className="font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="col-span-1 sm:col-span-2">
            <input
                type="text"
                name={id}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200"
            />
        </div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
        <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <div className="col-span-1 sm:col-span-2">
            <p className="text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


export const Settings: React.FC = () => {
    const { importData, roles, currentUser, hasPermission, isLoading } = useAppContext();
    const {
        logo: contextLogo, primaryColor: contextPrimaryColor, billingRulerSettings: contextBillingSettings,
        updateLogo, updatePrimaryColor, updateBillingRulerSettings
    } = useSettings();
    const { addToast } = useToast();

    // Local state for settings
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [gymName, setGymName] = useState('Ellite Corpus');
    const [currency, setCurrency] = useState('BRL');
    const [logo, setLogo] = useState<string | null>(null);
    const [primaryColor, setPrimaryColor] = useState('#22c55e');
    const [billingSettings, setBillingSettings] = useState<BillingRulerSettings>(contextBillingSettings);

    // Initial state to track changes
    const [initialState, setInitialState] = useState({
        isDarkTheme: false,
        gymName: 'Ellite Corpus',
        currency: 'BRL',
        logo: null as string | null,
        primaryColor: '#22c55e',
        billingSettings: contextBillingSettings,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
    const [dataToImport, setDataToImport] = useState<any | null>(null);

    useEffect(() => {
        const loadedTheme = localStorage.getItem('theme') === 'dark';
        const loadedGymName = localStorage.getItem('gymName') || 'Ellite Corpus';
        const loadedCurrency = localStorage.getItem('currency') || 'BRL';
        
        setIsDarkTheme(loadedTheme);
        setGymName(loadedGymName);
        setCurrency(loadedCurrency);
        setLogo(contextLogo);
        setPrimaryColor(contextPrimaryColor);
        setBillingSettings(contextBillingSettings);

        setInitialState({
            isDarkTheme: loadedTheme,
            gymName: loadedGymName,
            currency: loadedCurrency,
            logo: contextLogo,
            primaryColor: contextPrimaryColor,
            billingSettings: contextBillingSettings
        });
    }, [contextLogo, contextPrimaryColor, contextBillingSettings]);
    
    const isDirty = useMemo(() => {
        return isDarkTheme !== initialState.isDarkTheme ||
               gymName !== initialState.gymName ||
               currency !== initialState.currency ||
               logo !== initialState.logo ||
               primaryColor !== initialState.primaryColor ||
               JSON.stringify(billingSettings) !== JSON.stringify(initialState.billingSettings);
    }, [isDarkTheme, gymName, currency, logo, primaryColor, billingSettings, initialState]);

    const handleSaveSettings = () => {
        // Theme
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        if (isDarkTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // General
        localStorage.setItem('gymName', gymName);
        localStorage.setItem('currency', currency);

        // Customization
        updatePrimaryColor(primaryColor);
        if (logo !== initialState.logo) updateLogo(logo);

        // Billing Ruler
        updateBillingRulerSettings(billingSettings);
        
        // Update initial state to remove dirty flag
        setInitialState({
            isDarkTheme,
            gymName,
            currency,
            logo,
            primaryColor,
            billingSettings
        });
        
        addToast('Configurações salvas com sucesso!', 'success');
    };

    const handleResetChanges = () => {
        setIsDarkTheme(initialState.isDarkTheme);
        setGymName(initialState.gymName);
        setCurrency(initialState.currency);
        setLogo(initialState.logo);
        setPrimaryColor(initialState.primaryColor);
        setBillingSettings(initialState.billingSettings);
    };
    
    const handleBillingChange = (key: keyof BillingRulerSettings) => {
        setBillingSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    const handleExportData = () => {
        alert("A exportação de dados requer o estado completo do AppContext, que não é diretamente gerenciado aqui. Esta é uma função de demonstração.");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target?.result as string);
                    if (parsedData.members && parsedData.plans && parsedData.payments && parsedData.expenses) {
                        setDataToImport(parsedData);
                        setIsImportConfirmOpen(true);
                    } else {
                        addToast('Arquivo JSON inválido. Verifique o formato.', 'error');
                    }
                } catch (error) {
                    addToast('Erro ao ler o arquivo. Certifique-se que é um JSON válido.', 'error');
                }
            };
            reader.readAsText(file);
        }
        if(e.target) e.target.value = '';
    };

    const handleConfirmImport = () => {
        if (dataToImport) {
            importData(dataToImport);
        }
        setIsImportConfirmOpen(false);
        setDataToImport(null);
    };

    const handleLogoClick = () => {
        logoInputRef.current?.click();
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            addToast('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    };

    if (isLoading) {
        return <SettingsSkeleton />;
    }

    const currentRoleName = roles.find(r => r.id === currentUser?.roleId)?.name || 'N/A';

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Perfil do Usuário</CardTitle>
                    <CardDescription>Estas são suas informações de usuário atuais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <InfoItem label="E-mail" value={currentUser?.email} />
                        <InfoItem label="Função" value={currentRoleName} />
                    </div>
                </CardContent>
            </Card>

            {hasPermission(Permission.MANAGE_SETTINGS) && (
              <>
                <Card>
                    <CardHeader>
                        <CardTitle>Aparência e Marca</CardTitle>
                        <CardDescription>Personalize a aparência do aplicativo para corresponder à sua marca.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <ToggleSwitch id="theme" label="Modo Escuro" checked={isDarkTheme} onChange={(e) => setIsDarkTheme(e.target.checked)} />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                                <label className="font-medium text-gray-700 dark:text-gray-300">Logo da Academia</label>
                                <div className="col-span-1 sm:col-span-2 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                                        {logo ? (
                                            <img src={logo} alt="Logo da Academia" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-slate-500 text-center">Sem logo</span>
                                        )}
                                    </div>
                                    <Button variant="outline" onClick={handleLogoClick}>Alterar Logo</Button>
                                    <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                                <label htmlFor="primaryColor" className="font-medium text-gray-700 dark:text-gray-300">Cor Primária</label>
                                <div className="col-span-1 sm:col-span-2">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            id="primaryColor"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-10 h-10 p-0 border-none rounded-md cursor-pointer bg-transparent"
                                        />
                                        <span className="font-mono text-slate-600 dark:text-slate-400">{primaryColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Configurações Gerais</CardTitle>
                        <CardDescription>Defina informações básicas do seu estabelecimento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <SettingsInput id="gymName" label="Nome da Academia" value={gymName} onChange={(e) => setGymName(e.target.value)} />
                            <SettingsInput id="currency" label="Símbolo da Moeda" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Ex: BRL" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Régua de Cobrança</CardTitle>
                        <CardDescription>Configure lembretes automáticos para pagamentos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                            <ToggleSwitch id="reminderBeforeDue" label={`Lembrete (${billingSettings.reminderBeforeDue.days} dias antes do venc.)`} checked={billingSettings.reminderBeforeDue.enabled} onChange={() => handleBillingChange('reminderBeforeDue')} />
                            <ToggleSwitch id="reminderOnDue" label="Aviso (No dia do venc.)" checked={billingSettings.reminderOnDue.enabled} onChange={() => handleBillingChange('reminderOnDue')} />
                            <ToggleSwitch id="reminderAfterDue" label={`Notificação de Atraso (${billingSettings.reminderAfterDue.days} dias após)`} checked={billingSettings.reminderAfterDue.enabled} onChange={() => handleBillingChange('reminderAfterDue')} />
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-4">
                    <Button onClick={handleResetChanges} variant="outline" disabled={!isDirty}>Cancelar</Button>
                    <Button onClick={handleSaveSettings} disabled={!isDirty}>Salvar Alterações</Button>
                </div>

              </>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Gerenciamento de Dados</CardTitle>
                    <CardDescription>Exporte seus dados para um backup ou importe dados de outro sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={handleExportData} variant="outline" className="w-full justify-center">Exportar Dados (.json)</Button>
                        <Button onClick={handleImportClick} variant="primary" className="w-full justify-center">Importar Dados (.json)</Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    </div>
                </CardContent>
            </Card>

            {isImportConfirmOpen && (
                <ConfirmationModal
                    isOpen={isImportConfirmOpen}
                    onClose={() => setIsImportConfirmOpen(false)}
                    onConfirm={handleConfirmImport}
                    title="Confirmar Importação de Dados"
                    message="A importação de dados substituirá TODOS os dados existentes. Esta ação não pode ser desfeita. Deseja continuar?"
                    confirmText="Sim, importar"
                    confirmButtonClass="bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500"
                />
            )}
        </div>
    );
};
