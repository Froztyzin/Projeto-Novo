import React from 'react';

export const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const getInitials = (nameStr: string) => {
        if (!nameStr) return '??';
        const names = nameStr.trim().split(' ').filter(Boolean);
        if (names.length === 0) return '??';

        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        
        return names[0].substring(0, 2).toUpperCase();
    };
    return (
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm mr-4 flex-shrink-0">
            {getInitials(name)}
        </div>
    );
};
