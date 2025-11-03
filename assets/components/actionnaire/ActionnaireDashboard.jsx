import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { TrendingUp, LogOut, Building2, ArrowLeft } from 'lucide-react';

export function ActionnaireDashboard({ onLogout, onNavigate, onBack, user }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

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
                            <Building2 className="h-8 w-8" />
                            Espace Actionnaire
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Consultez les rapports et l'évolution de vos investissements
                        </p>
                    </div>

                    {/* Single Card */}
                    <div className="flex justify-center max-w-md mx-auto">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full w-full">
                            <CardContent className="p-6 h-full flex flex-col items-center text-center">
                                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-semibold">Rapports d'Évolution</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Accédez aux analyses détaillées et aux performances de vos investissements
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    size="default"
                                >
                                    Consulter les Évolutions
                                    <TrendingUp className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
