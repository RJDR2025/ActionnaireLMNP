import React, { useState, useEffect } from 'react';
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
import { UserCog, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export function EditUserModal({ open, onOpenChange, onSuccess, user }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [monthlyHours, setMonthlyHours] = useState('140');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load user data when modal opens or user changes
    useEffect(() => {
        if (open && user) {
            console.log('Loading user data:', user);
            setEmail(user.email || '');
            setName(user.name || '');
            setMonthlyHours((user.monthlyHours || 140).toString());
            // Filter out ROLE_USER as it's automatic
            const userRoles = user.roles.filter(role => role !== 'ROLE_USER');
            console.log('Selected roles:', userRoles);
            setSelectedRoles(userRoles);
            setError('');
            setSuccess(false);
        }
    }, [open, user]);

    const availableRoles = [
        { value: 'ROLE_ADMIN', label: 'Administrateur', color: 'text-red-600' },
        { value: 'ROLE_ACTIONNAIRE', label: 'Actionnaire', color: 'text-blue-600' },
        { value: 'ROLE_LMNP', label: 'Développeur LMNP', color: 'text-purple-600' },
        { value: 'ROLE_SCI', label: 'Développeur SCI', color: 'text-cyan-600' },
        { value: 'ROLE_DEV', label: 'Développeur', color: 'text-green-600' },
    ];

    const handleRoleToggle = (roleValue) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleValue)) {
                return prev.filter(r => r !== roleValue);
            } else {
                return [...prev, roleValue];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !name || !monthlyHours || selectedRoles.length === 0) {
            setError('Veuillez remplir tous les champs et sélectionner au moins un rôle');
            return;
        }

        const hours = parseInt(monthlyHours);
        if (isNaN(hours) || hours <= 0) {
            setError('Les heures mensuelles doivent être un nombre positif');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/user/${user.id}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    name,
                    monthlyHours: parseInt(monthlyHours),
                    roles: selectedRoles,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    handleClose();
                    onSuccess();
                }, 1500);
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setName('');
        setMonthlyHours('140');
        setSelectedRoles([]);
        setError('');
        setSuccess(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Modifier l'utilisateur</DialogTitle>
                            <DialogDescription>
                                {user && (
                                    <span>
                                        Modification de <strong>{user.name}</strong> (ID: {user.id})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="utilisateur@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom</label>
                                <Input
                                    type="text"
                                    placeholder="Nom de l'utilisateur"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Monthly Hours */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Heures mensuelles</label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="140"
                                    value={monthlyHours}
                                    onChange={(e) => setMonthlyHours(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nombre d'heures à effectuer par mois
                                </p>
                            </div>

                            {/* Roles - Multiple Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rôles (sélection multiple)</label>
                                <div className="border rounded-lg p-4 space-y-3">
                                    {availableRoles.map((role) => (
                                        <div key={role.value} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={role.value}
                                                checked={selectedRoles.includes(role.value)}
                                                onCheckedChange={() => handleRoleToggle(role.value)}
                                            />
                                            <label
                                                htmlFor={role.value}
                                                className={`text-sm font-medium cursor-pointer ${role.color}`}
                                            >
                                                {role.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Sélectionnez un ou plusieurs rôles pour cet utilisateur
                                </p>
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
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    <UserCog className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Modification...' : 'Modifier'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                                Utilisateur modifié avec succès
                            </DialogTitle>
                            <DialogDescription>
                                Les modifications ont été enregistrées.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-8 text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
