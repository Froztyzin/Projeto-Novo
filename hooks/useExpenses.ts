import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ExpenseStatus } from '../types';

const ITEMS_PER_PAGE = 10;

export const useExpenses = () => {
    const { expenses, isLoading } = useAppContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredExpenses = useMemo(() => {
        if (isLoading) return [];
        return expenses.filter(expense =>
            expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [expenses, searchTerm, isLoading]);

    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
    
    const currentExpenses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredExpenses.slice(start, end);
    }, [filteredExpenses, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
    
    const financialSummary = useMemo(() => {
        const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const paidAmount = filteredExpenses
            .filter(expense => expense.status === ExpenseStatus.Paid)
            .reduce((sum, expense) => sum + expense.amount, 0);
        const pendingAmount = totalAmount - paidAmount;
        return { totalAmount, paidAmount, pendingAmount };
    }, [filteredExpenses]);

    return {
        isLoading,
        expenses: currentExpenses,
        filteredExpenses,
        searchTerm,
        pagination: { currentPage, totalPages, ITEMS_PER_PAGE },
        financialSummary,
        handleSearchChange: setSearchTerm,
        handlePageChange: setCurrentPage,
    };
};
