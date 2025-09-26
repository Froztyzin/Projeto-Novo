import React, { useState, useMemo } from 'react';
import type { Payment } from '../types';
import { PaymentStatus } from '../types';
import { Button } from './ui/Button';
import { PaymentStatusBadge } from './ui/Badges';
import { useAppContext } from '../contexts/AppContext';
import { DayDetailsModal } from './DayDetailsModal';
import { Skeleton } from './ui/Skeleton';

const CalendarSkeleton: React.FC = () => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-semibold text-gray-500 dark:text-gray-400 py-2 text-xs sm:text-base">{day}</div>
                ))}
                {[...Array(35)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
        </div>
    );
};

const SummaryPaymentItem: React.FC<{ payment: Payment }> = ({ payment }) => {
    const statusClasses = {
        [PaymentStatus.Paid]: 'bg-green-400',
        [PaymentStatus.Pending]: 'bg-yellow-400',
        [PaymentStatus.Overdue]: 'bg-red-400',
    };
    return (
        <div className="flex items-center text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60 mb-1">
            <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${statusClasses[payment.status]}`} title={payment.status}></span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
                {payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
        </div>
    );
};

export const CalendarView: React.FC = () => {
  const { payments, members, plans, isLoading } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid: { date: Date; isCurrentMonth: boolean }[] = [];

    // Days from previous month
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth; i > 0; i--) {
        grid.push({
            date: new Date(year, month - 1, prevMonthLastDate - i + 1),
            isCurrentMonth: false,
        });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
          date: new Date(year, month, i),
          isCurrentMonth: true,
      });
    }

    // Days from next month
    const gridEndIndex = grid.length;
    const nextDays = 7 - (gridEndIndex % 7);
    if (nextDays < 7) {
        for (let i = 1; i <= nextDays; i++) {
            grid.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }
    }
    
    return grid;
  }, [currentDate]);

  const paymentsByDate = useMemo(() => {
    const map = new Map<string, Payment[]>();
    payments.forEach(payment => {
        const dateKey = new Date(payment.date).toDateString();
        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        map.get(dateKey)!.push(payment);
    });
    return map;
  }, [payments]);

  const handleDayClick = (date: Date) => {
    const dayPayments = paymentsByDate.get(date.toDateString()) || [];
    if (dayPayments.length > 0) {
      setSelectedDate(date);
      setIsDetailsModalOpen(true);
    }
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  if (isLoading) {
      return <CalendarSkeleton />;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={handlePrevMonth}>&lt; Anterior</Button>
          <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
          </h2>
          <Button variant="outline" onClick={handleNextMonth}>Próximo &gt;</Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold text-gray-500 dark:text-gray-400 py-2 text-xs sm:text-base">{day}</div>
          ))}

          {calendarGrid.map((dayInfo, index) => {
              const dayKey = dayInfo.date.toDateString();
              const dayPayments = paymentsByDate.get(dayKey) || [];
              const isToday = dayInfo.date.toDateString() === new Date().toDateString() && dayInfo.isCurrentMonth;
              
              return (
                  <div 
                      key={index} 
                      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex flex-col min-h-[100px] sm:min-h-[120px] transition-all duration-300 ease-in-out ${dayInfo.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/40'} ${dayPayments.length > 0 ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700' : ''}`}
                      onClick={() => handleDayClick(dayInfo.date)}
                  >
                      <span className={`font-bold text-sm self-start ${isToday ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''} ${dayInfo.isCurrentMonth ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                          {dayInfo.date.getDate()}
                      </span>
                      <div className="mt-1 overflow-y-auto flex-1">
                        <>
                            {dayPayments.slice(0, 3).map(p => <SummaryPaymentItem key={p.id} payment={p} />)}
                            {dayPayments.length > 3 && (
                                <div className="text-xs text-center text-primary-600 dark:text-primary-400 font-semibold p-1 rounded-md bg-primary-50 dark:bg-primary-900/50 mt-1">
                                    + {dayPayments.length - 3} mais
                                </div>
                            )}
                        </>
                      </div>
                  </div>
              )
          })}
        </div>
      </div>
      
      {selectedDate && (
        <DayDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            date={selectedDate}
            payments={paymentsByDate.get(selectedDate.toDateString()) || []}
            members={members}
            plans={plans}
        />
      )}
    </>
  );
};