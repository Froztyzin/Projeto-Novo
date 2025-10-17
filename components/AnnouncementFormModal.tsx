
import React, { useState, useEffect } from 'react';
import type { Announcement } from '../types';
import { AnnouncementType } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'|'createdAt'|'authorId'>) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  announcement: Announcement | null;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({ isOpen, onClose, addAnnouncement, updateAnnouncement, announcement }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: AnnouncementType.Info,
    });
    
    useEffect(() => {
        if (announcement) {
            setFormData({
                title: announcement.title,
                content: announcement.content,
                type: announcement.type,
            });
        } else {
            setFormData({
                title: '',
                content: '',
                type: AnnouncementType.Info,
            });
        }
    }, [announcement, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (announcement) {
            updateAnnouncement({ ...announcement, ...formData });
        } else {
            addAnnouncement(formData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={announcement ? 'Editar Comunicado' : 'Novo Comunicado'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300">Título</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-slate-700" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-slate-300">Tipo</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-slate-700">
                        {Object.values(AnnouncementType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-slate-300">Conteúdo</label>
                    <textarea name="content" id="content" value={formData.content} onChange={handleChange} required rows={6} className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-slate-700" placeholder="Use markdown para formatação (ex: **negrito**, *itálico*, - lista)."></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">{announcement ? 'Salvar Alterações' : 'Publicar Comunicado'}</Button>
                </div>
            </form>
        </Modal>
    );
};
