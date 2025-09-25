import React from 'react';
import { SparklesIcon } from './ui/Icons';
import { Skeleton } from './ui/Skeleton';
import { markdownToHtml } from '../utils';

interface AIInsightCardProps {
  insight: string;
}

export const AIInsightCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 rounded-full mr-3" />
            <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
);

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border-l-4 border-primary-500 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-3 text-primary-500" />
                Análise da IA
            </h3>
            <div
                className="text-gray-600 dark:text-gray-300 leading-relaxed ai-content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(insight) }}
            >
            </div>
        </div>
    );
};