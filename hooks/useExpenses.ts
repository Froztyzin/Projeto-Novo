import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ExpenseStatus } from '../types';

const ITEMS_PER_PAGE = 10;

export const useExpenses = () => {
    const { expenses, isLoading } = useAppContext();
    
    const [filters, setFilters] = useState({
        searchTerm: '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredExpenses = useMemo(() => {
        if (isLoading) return [];
        return expenses.filter(expense => {
            const searchTermMatch =
                expense.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                expense.category.toLowerCase().includes(filters.searchTerm.toLowerCase());
            
            const expenseDate = new Date(expense.date);
            expenseDate.setHours(0, 0, 0, 0);

            const startDateMatch = filters.startDate === '' || expenseDate >= new Date(new Date(filters.startDate).setHours(0,0,0,0));
            const endDateMatch = filters.endDate === '' || expenseDate <= new Date(new Date(filters.endDate).setHours(0,0,0,0));
            
            return searchTermMatch && startDateMatch && endDateMatch;
        });
    }, [expenses, filters, isLoading]);

    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
    
    const currentExpenses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredExpenses.slice(start, end);
    }, [filteredExpenses, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);
    
    const financialSummary = useMemo(() => {
        const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const paidAmount = filteredExpenses
            .filter(expense => expense.status === ExpenseStatus.Paid)
            .reduce((sum, expense) => sum + expense.amount, 0);
        const pendingAmount = totalAmount - paidAmount;
        return { totalAmount, paidAmount, pendingAmount };
    }, [filteredExpenses]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: '',
            startDate: '',
            endDate: '',
        });
    }

    return {
        isLoading,
        expenses: currentExpenses,
        filteredExpenses,
        filters,
        pagination: { currentPage, totalPages, ITEMS_PER_PAGE },
        financialSummary,
        handleFilterChange,
        handlePageChange: setCurrentPage,
        clearFilters,
    };
};