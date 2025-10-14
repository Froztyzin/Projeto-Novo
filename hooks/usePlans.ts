import { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

const ITEMS_PER_PAGE = 6;

export const usePlans = () => {
    const { plans, isLoading } = useAppContext();
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(plans.length / ITEMS_PER_PAGE);

    const currentPlans = useMemo(() => {
        if (isLoading) return [];
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return plans.slice(start, end);
    }, [plans, currentPage, isLoading]);

    return {
        isLoading,
        plans: currentPlans,
        allPlans: plans,
        pagination: { currentPage, totalPages, ITEMS_PER_PAGE },
        handlePageChange: setCurrentPage,
    };
};
