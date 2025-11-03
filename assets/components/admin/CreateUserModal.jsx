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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Copy, CheckCircle2 } from 'lucide-react';

export function CreateUserModal({ open, onOpenChange, onSuccess }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [monthlyHours, setMonthlyHours] = useState('140');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [createdUser, setCreatedUser] = useState(null);
    const [copied, setCopied] = useState(false);

    const availableRoles = [
        { value: 'admin', backendValue: 'ROLE_ADMIN', label: 'Administrateur', color: 'text-red-600' },
        { value: 'actionnaire', backendValue: 'ROLE_ACTIONNAIRE', label: 'Actionnaire', color: 'text-blue-600' },
        { value: 'lmnp', backendValue: 'ROLE_LMNP', label: 'Développeur LMNP', color: 'text-purple-600' },
        { value: 'sci', backendValue: 'ROLE_SCI', label: 'Développeur SCI', color: 'text-cyan-600' },
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

        if (!email || !name || selectedRoles.length === 0 || !monthlyHours) {
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
            const response = await fetch('/api/user/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    name,
                    roles: selectedRoles,
                    monthlyHours: parseInt(monthlyHours),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setCreatedUser(data.user);
                onSuccess();
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyCredentials = () => {
        if (createdUser) {
            const credentials = `Email: ${createdUser.email}\nMot de passe: ${createdUser.password}`;
            navigator.clipboard.writeText(credentials);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setEmail('');
        setName('');
        setSelectedRoles([]);
        setMonthlyHours('140');
        setError('');
        setCreatedUser(null);
        setCopied(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                {!createdUser ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Créer un utilisateur</DialogTitle>
                            <DialogDescription>
                                Créez un nouveau compte utilisateur avec un mot de passe sécurisé généré automatiquement
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
                                    Nombre d'heures à effectuer par mois (par défaut: 140h)
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
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Création...' : 'Créer l\'utilisateur'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                                Utilisateur créé avec succès
                            </DialogTitle>
                            <DialogDescription>
                                Voici les identifiants de connexion. Copiez-les et partagez-les de manière sécurisée.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">ID Utilisateur</label>
                                    <p className="text-sm font-mono font-semibold">{createdUser.id}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
                                    <p className="text-sm font-mono font-semibold">{createdUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nom</label>
                                    <p className="text-sm font-mono font-semibold">{createdUser.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Mot de passe</label>
                                    <p className="text-sm font-mono font-semibold bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                        {createdUser.password}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    ⚠️ Important : Ce mot de passe ne sera affiché qu'une seule fois. Assurez-vous de le copier et de le partager de manière sécurisée.
                                </p>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={handleCopyCredentials}
                                    className="gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Copié !
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copier les identifiants
                                        </>
                                    )}
                                </Button>
                                <Button onClick={handleClose}>
                                    Terminer
                                </Button>
                            </DialogFooter>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
