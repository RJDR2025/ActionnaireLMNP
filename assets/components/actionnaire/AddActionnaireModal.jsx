import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Check } from 'lucide-react';

export function AddActionnaireModal({ open, onOpenChange, onSuccess }) {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [nombreParts, setNombreParts] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/actionnaire/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nom,
                    prenom,
                    email,
                    nombreParts: parseInt(nombreParts),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    onOpenChange(false);
                    resetForm();
                    if (onSuccess) onSuccess();
                }, 2000);
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (error) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setNom('');
        setPrenom('');
        setEmail('');
        setNombreParts('');
        setError('');
    };

    const handleClose = () => {
        if (!isLoading) {
            resetForm();
            onOpenChange(false);
        }
    };

    if (showSuccess) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">Actionnaire créé !</h3>
                            <p className="text-sm text-gray-600">
                                L'actionnaire a été ajouté avec succès
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-green-600" />
                        Ajouter un actionnaire
                    </DialogTitle>
                    <DialogDescription>
                        Remplissez les informations de l'actionnaire
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="nom">Nom *</Label>
                        <Input
                            id="nom"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder="Dupont"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom *</Label>
                        <Input
                            id="prenom"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder="Jean"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jean.dupont@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombreParts">Nombre de parts *</Label>
                        <Input
                            id="nombreParts"
                            type="number"
                            min="1"
                            value={nombreParts}
                            onChange={(e) => setNombreParts(e.target.value)}
                            placeholder="100"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? 'Création...' : 'Créer l\'actionnaire'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
