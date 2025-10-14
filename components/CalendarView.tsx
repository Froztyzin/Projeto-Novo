
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChevronLeftIcon, ChevronRightIcon } from './ui/Icons';
import { DayDetailsModal } from './DayDetailsModal';
import { PaymentStatus } from '../types';
import type { Payment } from '../types';
import { Skeleton } from './ui/Skeleton';
import { Button } from './ui/Button';

const CalendarSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-12" />
        </div>
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2 py-2">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-4 w-1/2 mx-auto" />)}
        </div>
        <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => <Skeleton key={i} className="h-28 rounded-md" />)}
        </div>
    </div>
);


export const CalendarView: React.FC = () => {
    const { payments, members, plans, isLoading } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const paymentsByDate = useMemo(() => {
        const grouped: { [key: string]: Payment[] } = {};
        payments.forEach(payment => {
            const dateStr = new Date(payment.date).toISOString().split('T')[0];
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(payment);
        });
        return grouped;
    }, [payments]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (paymentsByDate[dateStr]?.length > 0) {
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        // Adjust to make week start on Sunday (getDay() returns 0 for Sunday)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Days from previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`prev-${i}`} className="bg-gray-50 dark:bg-gray-900/40 rounded-md"></div>);
        }
        
        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayPayments = paymentsByDate[dateStr] || [];
            
            const today = new Date();
            today.setHours(0,0,0,0);
            const isToday = date.getTime() === today.getTime();

            days.push(
                <div 
                    key={day} 
                    className={`p-2 rounded-md flex flex-col h-28 sm:h-32 transition-colors
                        ${dayPayments.length > 0 ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer' : 'bg-gray-100 dark:bg-gray-900/60 text-gray-400 dark:text-gray-500'}
                        ${isToday ? 'border-2 border-primary-500' : ''}`}
                    onClick={() => handleDayClick(date)}
                >
                    <span className={`font-semibold ${isToday ? 'text-primary-500' : 'text-gray-800 dark:text-gray-200'}`}>{day}</span>
                    <div className="mt-1 overflow-y-auto text-xs space-y-1 pr-1">
                        {dayPayments.slice(0, 3).map(p => (
                            <div key={p.id} className={`p-1 rounded flex items-center
                                ${p.status === PaymentStatus.Paid ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : ''}
                                ${p.status === PaymentStatus.Pending ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' : ''}
                                ${p.status === PaymentStatus.Overdue ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' : ''}
                            `}>
                               <span className="truncate">{members.find(m => m.id === p.memberId)?.name || '...'}</span>
                            </div>
                        ))}
                        {dayPayments.length > 3 && (
                            <div className="text-gray-500 dark:text-gray-400 text-center font-medium">
                                +{dayPayments.length - 3} mais
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        return days;
    };

    if (isLoading) {
        return <CalendarSkeleton />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeftIcon className="h-6 w-6" />
                    </Button>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 text-center w-48">
                        {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRightIcon className="h-6 w-6" />
                    </Button>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button variant="outline" onClick={handleToday}>Hoje</Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2 py-2">
                <div>Dom</div>
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sáb</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {renderCalendarGrid()}
            </div>
            <DayDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selectedDate}
                payments={selectedDate ? paymentsByDate[selectedDate.toISOString().split('T')[0]] || [] : []}
                members={members}
                plans={plans}
            />
        </div>
    );
};
