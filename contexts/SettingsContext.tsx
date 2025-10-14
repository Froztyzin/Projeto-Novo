import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateColorPalette } from '../utils';
import { useAppContext } from './AppContext';
import { LogActionType } from '../types';

export interface BillingRulerSettings {
  reminderBeforeDue: { enabled: boolean; days: number };
  reminderOnDue: { enabled: boolean };
  reminderAfterDue: { enabled: boolean; days: number };
}

interface SettingsContextType {
  logo: string | null;
  primaryColor: string;
  billingRulerSettings: BillingRulerSettings;
  updateLogo: (logo: string | null) => void;
  updatePrimaryColor: (color: string) => void;
  updateBillingRulerSettings: (settings: BillingRulerSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addAuditLog } = useAppContext();
  const [logo, setLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [billingRulerSettings, setBillingRulerSettings] = useState<BillingRulerSettings>({
    reminderBeforeDue: { enabled: true, days: 3 },
    reminderOnDue: { enabled: true },
    reminderAfterDue: { enabled: true, days: 5 },
  });

  useEffect(() => {
    const loadCustomization = () => {
      const storedLogo = localStorage.getItem('customLogo');
      const storedColor = localStorage.getItem('primaryColor');
      const storedBillingSettings = localStorage.getItem('billingRulerSettings');

      if (storedLogo) setLogo(storedLogo);
      if (storedColor) setPrimaryColor(storedColor);
      if (storedBillingSettings) setBillingRulerSettings(JSON.parse(storedBillingSettings));
    };
    loadCustomization();
  }, []);

  useEffect(() => {
    const palette = generateColorPalette(primaryColor);
    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    
    const cssVariables = Object.entries(palette)
        .map(([shade, rgbString]) => `--color-primary-${shade}: ${rgbString};`)
        .join('\n');
    
    styleTag.innerHTML = `:root { ${cssVariables} }`;
  }, [primaryColor]);

  const updateLogo = (newLogo: string | null) => {
    if (newLogo) {
      localStorage.setItem('customLogo', newLogo);
      setLogo(newLogo);
    } else {
      localStorage.removeItem('customLogo');
      setLogo(null);
    }
     addAuditLog(LogActionType.UPDATE_SETTINGS, 'Atualizou o logo da academia.');
  }

  const updatePrimaryColor = (newColor: string) => {
      localStorage.setItem('primaryColor', newColor);
      setPrimaryColor(newColor);
      addAuditLog(LogActionType.UPDATE_SETTINGS, `Alterou a cor primária para ${newColor}.`);
  }
  
  const updateBillingRulerSettings = (settings: BillingRulerSettings) => {
    localStorage.setItem('billingRulerSettings', JSON.stringify(settings));
    setBillingRulerSettings(settings);
    addAuditLog(LogActionType.UPDATE_SETTINGS, 'Atualizou as configurações da régua de cobrança.');
  };

  const value = {
    logo,
    primaryColor,
    billingRulerSettings,
    updateLogo,
    updatePrimaryColor,
    updateBillingRulerSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
};