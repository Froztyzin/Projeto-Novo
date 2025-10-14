import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Member } from '../types';
import { MemberStatus } from '../types';

const ITEMS_PER_PAGE = 10;

export const useMembers = () => {
  const { members, isLoading } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    if (isLoading) return [];
    return members.filter(member => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const searchMatch = member.name.toLowerCase().includes(lowerCaseSearch) ||
                          member.email.toLowerCase().includes(lowerCaseSearch) ||
                          (member.telefone || '').replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
      const statusMatch = statusFilter === 'all' || member.status === statusFilter;
      const planMatch = planFilter === 'all' || member.planId === planFilter;
      return searchMatch && statusMatch && planMatch;
    });
  }, [members, searchTerm, statusFilter, planFilter, isLoading]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

  const currentMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, currentPage]);
  
  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanFilter('all');
    setCurrentPage(1);
  };

  return {
    isLoading,
    members: currentMembers,
    allMembers: members, 
    filteredMembers, 
    filters: { searchTerm, statusFilter, planFilter },
    pagination: { currentPage, totalPages, ITEMS_PER_PAGE },
    handleSearchChange: setSearchTerm,
    handleStatusChange: setStatusFilter,
    handlePlanChange: setPlanFilter,
    handlePageChange: setCurrentPage,
    clearFilters,
  };
};
