import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { AddActionnaireModal } from './AddActionnaireModal';
import { EditActionnaireModal } from './EditActionnaireModal';
import { ArrowLeft, LogOut, User, UserPlus, Mail, Edit, Trash2, Building2 } from 'lucide-react';

export function ActionnaireManagement({ onLogout, onBack, user, openAddModal = false }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);
    const [actionnaires, setActionnaires] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModal);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedActionnaire, setSelectedActionnaire] = useState(null);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

    const fetchActionnaires = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/actionnaire/list', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setActionnaires(data.actionnaires || []);
            }
        } catch (error) {
            console.error('Error fetching actionnaires:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActionnaires();
    }, []);

    const handleEdit = (actionnaire) => {
        setSelectedActionnaire(actionnaire);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet actionnaire ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/actionnaire/${id}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchActionnaires();
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting actionnaire:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-16">
            {/* Header */}
            <header className="w-full border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-black rounded-md px-3 py-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={onBack}>
                            <img
                                src="/medias/images/logo-a599f4ae.svg"
                                alt="Logo"
                                className="h-6 w-auto"
                            />
                        </div>
                        {onBack && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onBack}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onLogout}
                        className="gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Building2 className="h-8 w-8" />
                            Gestion des actionnaires
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez les actionnaires et leur participation
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Ajouter un actionnaire
                    </Button>
                </div>

                {/* Actionnaires Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des actionnaires</CardTitle>
                        <CardDescription>
                            {actionnaires.length} actionnaire{actionnaires.length !== 1 ? 's' : ''} enregistré{actionnaires.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Chargement...
                            </div>
                        ) : actionnaires.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Aucun actionnaire trouvé</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nom complet</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Parts</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionnaires.map((actionnaire) => (
                                            <tr key={actionnaire.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <span className="text-sm font-mono text-muted-foreground">#{actionnaire.id}</span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                                                            <User className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <span className="font-medium">{actionnaire.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-4 w-4" />
                                                        {actionnaire.email}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md w-fit">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">
                                                            {actionnaire.nombreParts} parts
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(actionnaire)}
                                                            className="gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Modifier
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(actionnaire.id)}
                                                            className="gap-2 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Supprimer
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AddActionnaireModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={() => {
                    fetchActionnaires();
                }}
            />

            <EditActionnaireModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onSuccess={() => {
                    fetchActionnaires();
                }}
                actionnaire={selectedActionnaire}
            />

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
