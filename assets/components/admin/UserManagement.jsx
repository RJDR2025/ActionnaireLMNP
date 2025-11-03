import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { MonthlyHoursPlanningModal } from '@/components/admin/MonthlyHoursPlanningModal';
import { ArrowLeft, LogOut, User, UserPlus, Mail, Shield, Calendar, Clock, Edit, Trash2 } from 'lucide-react';

export function UserManagement({ onLogout, selectedApp, onBack, user }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
    const [planningUser, setPlanningUser] = useState(null);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const app = selectedApp === 'lmnp-admin' ? 'lmnp' : 'sci';
            const response = await fetch(`/api/user/list?app=${app}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedApp]);

    const handleEditUser = (u) => {
        setSelectedUser(u);
        setIsEditUserModalOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/user/${userId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchUsers(); // Refresh the list
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const appName = selectedApp === 'lmnp-admin' ? 'LMNP.AI' : 'SCI.AI';

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
            case 'ROLE_ACTIONNAIRE':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'ROLE_LMNP':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'ROLE_SCI':
                return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';
            case 'ROLE_DEV':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatRoleName = (role) => {
        const roleNames = {
            'ROLE_ADMIN': 'Administrateur',
            'ROLE_ACTIONNAIRE': 'Actionnaire',
            'ROLE_LMNP': 'Développeur LMNP',
            'ROLE_SCI': 'Développeur SCI',
            'ROLE_DEV': 'Développeur',
            'ROLE_USER': 'Utilisateur',
        };
        return roleNames[role] || role;
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
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestion des utilisateurs
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Consulter et gérer tous les comptes utilisateurs
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateUserModalOpen(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Créer un utilisateur
                    </Button>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des utilisateurs</CardTitle>
                        <CardDescription>
                            {users.length} utilisateur{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Chargement...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Utilisateur</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rôles</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Heures/mois</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <span className="text-sm font-mono text-muted-foreground">#{u.id}</span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                                                            <User className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <span className="font-medium">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-4 w-4" />
                                                        {u.email}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {u.roles.map((role) => (
                                                            <span
                                                                key={role}
                                                                className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(role)}`}
                                                            >
                                                                {formatRoleName(role)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md w-fit">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">
                                                            {u.currentMonthHours || u.monthlyHours || 140}h
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditUser(u)}
                                                            className="gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Modifier
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setPlanningUser(u);
                                                                setIsPlanningModalOpen(true);
                                                            }}
                                                            className="gap-2"
                                                        >
                                                            <Calendar className="h-4 w-4" />
                                                            Planifier
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(u.id)}
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

            <CreateUserModal
                open={isCreateUserModalOpen}
                onOpenChange={setIsCreateUserModalOpen}
                onSuccess={() => {
                    fetchUsers(); // Refresh the list
                }}
            />

            <EditUserModal
                open={isEditUserModalOpen}
                onOpenChange={setIsEditUserModalOpen}
                onSuccess={() => {
                    fetchUsers(); // Refresh the list
                }}
                user={selectedUser}
            />

            <MonthlyHoursPlanningModal
                open={isPlanningModalOpen}
                onOpenChange={setIsPlanningModalOpen}
                user={planningUser}
                selectedApp={selectedApp}
            />

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
