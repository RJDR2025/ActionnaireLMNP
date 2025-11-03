import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { UserPlus, Users, Clock, LogOut, Settings, ArrowLeft } from 'lucide-react';

export function AdminDashboard({ onLogout, selectedApp, onNavigate, onBack, user }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

    const appName = selectedApp === 'lmnp-admin' ? 'LMNP.AI' : 'SCI.AI';
    const logoSrc = selectedApp === 'lmnp-admin' ? '/medias/images/logo_lmnp.png' : '/medias/images/logo_sci.png';

    const adminCards = [
        {
            title: 'Créer un utilisateur',
            description: 'Ajouter un nouveau développeur ou actionnaire',
            icon: UserPlus,
            action: () => setIsCreateUserModalOpen(true),
        },
        {
            title: 'Gérer les utilisateurs',
            description: 'Consulter et modifier les comptes utilisateurs',
            icon: Users,
            action: () => onNavigate('users'),
        },
        {
            title: 'Suivre les temps',
            description: 'Consulter le planning et les heures des développeurs',
            icon: Clock,
            action: () => onNavigate('time-tracking'),
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background pb-16">
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
                        <div className="h-6 w-px bg-border" />
                        <img
                            src={logoSrc}
                            alt={appName}
                            className="h-8 w-auto"
                        />
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

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-6xl space-y-12">
                    {/* Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
                            <Settings className="h-8 w-8" />
                            Administration {appName}
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Gérez les utilisateurs, suivez les temps et configurez la plateforme
                        </p>
                    </div>

                    {/* Admin Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {adminCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Card
                                    key={card.title}
                                    className="hover:shadow-md transition-shadow cursor-pointer h-full"
                                    onClick={card.action}
                                >
                                    <CardContent className="p-6 h-full flex flex-col items-center text-center">
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                                <Icon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-semibold">{card.title}</h2>
                                                <p className="text-sm text-muted-foreground">
                                                    {card.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full mt-4"
                                            size="default"
                                        >
                                            Accéder
                                            <Icon className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>

            <CreateUserModal
                open={isCreateUserModalOpen}
                onOpenChange={setIsCreateUserModalOpen}
                onSuccess={() => {
                    // Modal fermée avec succès
                }}
            />

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
