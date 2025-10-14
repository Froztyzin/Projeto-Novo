// FIX: Imported React to provide the namespace for types like React.ChangeEvent.
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Payment, Member, Plan } from '../types';
import { PaymentStatus } from '../types';

const ITEMS_PER_PAGE = 10;
type SortableKeys = keyof Payment | 'memberName' | 'planName';

export const usePayments = () => {
    const { payments, members, plans, isLoading } = useAppContext();
    
    const memberMap = useMemo(() => members.reduce((acc, member) => ({ ...acc, [member.id]: member }), {} as Record<string, Member>), [members]);
    const planMap = useMemo(() => plans.reduce((acc, plan) => ({ ...acc, [plan.id]: plan }), {} as Record<string, Plan>), [plans]);
    
    const [filters, setFilters] = useState({ searchTerm: '', status: 'all', startDate: '', endDate: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);

    const processedPayments = useMemo(() => {
        if (isLoading) return [];

        const filtered = payments.filter(p => {
            const memberName = memberMap[p.memberId]?.name || '';
            const searchMatch = filters.searchTerm === '' || memberName.toLowerCase().includes(filters.searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
            const statusMatch = filters.status === 'all' || p.status === filters.status;
            const startDateMatch = filters.startDate === '' || new Date(new Date(p.date).setHours(0,0,0,0)) >= new Date(new Date(filters.startDate).setHours(0,0,0,0));
            const endDateMatch = filters.endDate === '' || new Date(new Date(p.date).setHours(0,0,0,0)) <= new Date(new Date(filters.endDate).setHours(0,0,0,0));
            return searchMatch && statusMatch && startDateMatch && endDateMatch;
        });

        return filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'memberName') {
                aValue = memberMap[a.memberId]?.name || '';
                bValue = memberMap[b.memberId]?.name || '';
            } else if (sortConfig.key === 'planName') {
                aValue = planMap[a.planId]?.name || '';
                bValue = planMap[b.planId]?.name || '';
            } else {
                aValue = a[sortConfig.key as keyof Payment];
                bValue = b[sortConfig.key as keyof Payment];
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [payments, filters, sortConfig, memberMap, planMap, isLoading]);

    const totalPages = Math.ceil(processedPayments.length / ITEMS_PER_PAGE);

    const currentPayments = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return processedPayments.slice(start, end);
    }, [processedPayments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortConfig]);

    const kpiData = useMemo(() => {
        return processedPayments.reduce((acc, p) => {
            if(p.status === PaymentStatus.Paid) {
                acc.paid.total += p.amount;
                acc.paid.count++;
            } else if (p.status === PaymentStatus.Pending) {
                acc.pending.total += p.amount;
                acc.pending.count++;
            } else if (p.status === PaymentStatus.Overdue) {
                acc.overdue.total += p.amount;
                acc.overdue.count++;
            }
            return acc;
        }, {
            paid: { total: 0, count: 0 },
            pending: { total: 0, count: 0 },
            overdue: { total: 0, count: 0 },
        });
    }, [processedPayments]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return {
        isLoading,
        payments: currentPayments,
        processedPayments,
        // FIX: Expose all payments to allow components to check total count vs filtered count.
        allPayments: payments,
        memberMap,
        planMap,
        filters,
        sortConfig,
        pagination: { currentPage, totalPages, ITEMS_PER_PAGE },
        kpiData,
        handleFilterChange,
        requestSort,
        handlePageChange: setCurrentPage,
    };
};
