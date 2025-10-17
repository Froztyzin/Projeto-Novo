
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Announcement } from '../types';
import { Permission, AnnouncementType } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, MegaphoneIcon } from './ui/Icons';
import { Skeleton } from './ui/Skeleton';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { markdownToHtml } from '../utils';

const AnnouncementsSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Skeleton className="h-10 w-44" />
        </div>
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
    </div>
);

const AnnouncementCard: React.FC<{
    announcement: Announcement;
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}> = ({ announcement, onEdit, onDelete, canEdit, canDelete }) => {
    const typeClasses = {
        [AnnouncementType.Info]: 'border-blue-500',
        [AnnouncementType.Promotion]: 'border-purple-500',
        [AnnouncementType.Warning]: 'border-yellow-500',
    };

    return (
        <div className={`bg-slate-800 rounded-lg shadow-md border-l-4 ${typeClasses[announcement.type]} overflow-hidden`}>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{announcement.type}</p>
                        <h3 className="text-xl font-bold text-slate-100 mt-1">{announcement.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm text-slate-400">
                            {new Date(announcement.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div 
                    className="mt-4 text-slate-300 ai-content"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(announcement.content) }}
                ></div>
            </div>
            <div className="bg-slate-800/50 px-6 py-3 flex justify-end space-x-2">
                {canEdit && <Button variant="ghost" size="sm" onClick={() => onEdit(announcement)}><EditIcon className="w-4 h-4 mr-2" /> Editar</Button>}
                {canDelete && <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => onDelete(announcement.id)}><TrashIcon className="w-4 h-4 mr-2" /> Excluir</Button>}
            </div>
        </div>
    );
};


export const Announcements: React.FC = () => {
    const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, hasPermission, isLoading } = useAppContext();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

    const handleAddNew = () => {
        setEditingAnnouncement(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsFormModalOpen(true);
    };

    const handleDeleteRequest = (id: string) => {
        setAnnouncementToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (announcementToDelete) {
            deleteAnnouncement(announcementToDelete);
        }
        setIsConfirmModalOpen(false);
        setAnnouncementToDelete(null);
    };
    
    if (isLoading) {
        return <AnnouncementsSkeleton />;
    }

    return (
        <div className="space-y-6">
            {hasPermission(Permission.CREATE_ANNOUNCEMENTS) && (
                <div className="flex justify-end">
                    <Button onClick={handleAddNew}>
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Criar Comunicado
                    </Button>
                </div>
            )}
            
            {announcements.length > 0 ? (
                <div className="space-y-4">
                    {announcements.map((ann, index) => (
                        <div key={ann.id} className="animate-stagger" style={{ animationDelay: `${index * 70}ms` }}>
                            <AnnouncementCard 
                                announcement={ann}
                                onEdit={handleEdit}
                                onDelete={handleDeleteRequest}
                                canEdit={hasPermission(Permission.UPDATE_ANNOUNCEMENTS)}
                                canDelete={hasPermission(Permission.DELETE_ANNOUNCEMENTS)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-800 rounded-lg">
                    <MegaphoneIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <h3 className="mt-2 text-lg font-medium text-slate-200">Nenhum comunicado publicado</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {hasPermission(Permission.CREATE_ANNOUNCEMENTS) ? "Clique em 'Criar Comunicado' para enviar uma mensagem aos alunos." : "Ainda não há comunicados para exibir."}
                    </p>
                </div>
            )}
            
            {isFormModalOpen && (
                <AnnouncementFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    addAnnouncement={addAnnouncement}
                    updateAnnouncement={updateAnnouncement}
                    announcement={editingAnnouncement}
                />
            )}

            {isConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Exclusão"
                    message="Você tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita."
                />
            )}
        </div>
    );
};
