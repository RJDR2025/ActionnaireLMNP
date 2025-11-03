import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Clock, Calendar } from 'lucide-react';

export function AddTimeEntryModal({ open, onOpenChange, onSuccess, selectedApp }) {
    const [hours, setHours] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([{ title: '', description: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleAddTask = () => {
        setTasks([...tasks, { title: '', description: '' }]);
    };

    const handleRemoveTask = (index) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((_, i) => i !== index));
        }
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        const filteredTasks = tasks.filter(task => task.title.trim() !== '');

        if (!hours || parseFloat(hours) <= 0) {
            setError('Veuillez entrer un nombre d\'heures valide');
            return;
        }

        if (filteredTasks.length === 0) {
            setError('Veuillez entrer au moins un titre de tâche');
            return;
        }

        if (!date) {
            setError('Veuillez sélectionner une date');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/time-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    hours: parseFloat(hours),
                    date: date,
                    tasks: filteredTasks,
                    app: selectedApp,
                }),
            });

            if (response.ok) {
                // Reset form
                setHours('');
                setDate(new Date().toISOString().split('T')[0]);
                setTasks([{ title: '', description: '' }]);
                setError('');
                onSuccess();
                onOpenChange(false);
            } else {
                const data = await response.json();
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Ajouter une entrée de temps</DialogTitle>
                    <DialogDescription>
                        Enregistrez vos heures de travail et les tâches effectuées
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Date
                        </label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Hours */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            Nombre d'heures
                        </label>
                        <Input
                            type="number"
                            step="0.5"
                            min="0.5"
                            placeholder="Ex: 8"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            required
                        />
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tâches effectuées</label>
                        <div className="space-y-4">
                            {tasks.map((task, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">Tâche {index + 1}</span>
                                        {tasks.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveTask(index)}
                                                className="h-6 w-6"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="Titre de la tâche"
                                        value={task.title}
                                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Description de la tâche (optionnelle)"
                                        value={task.description}
                                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTask}
                            className="w-full mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une tâche
                        </Button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
