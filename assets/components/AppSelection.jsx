import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { InstallPWAButton } from '@/components/InstallPWAButton';
import { ArrowRight, LogOut, Settings, TrendingUp, FileText, Building2, UserPlus } from 'lucide-react';

export function AppSelection({ onSelect, onLogout, user }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

    // Get the main role (first one that's not ROLE_USER)
    const mainRole = Array.isArray(currentRole)
        ? currentRole.find(r => r !== 'ROLE_USER') || 'ROLE_USER'
        : currentRole;

    // Render different content based on role
    const renderContent = () => {
        if (mainRole === 'ROLE_ADMIN') {
            return (
                <>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Administration
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Gérez les paramètres et la configuration des plateformes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {/* LMNP.AI Admin Card */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <img
                                    src="/medias/images/logo_lmnp.png"
                                    alt="LMNP.AI"
                                    className="h-24 w-auto"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold">Administration LMNP.AI</h2>
                                </div>
                                <Button
                                    onClick={() => onSelect('lmnp-admin')}
                                    className="w-full"
                                    size="default"
                                >
                                    Administrer
                                    <Settings className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* SCI.AI Admin Card */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <img
                                    src="/medias/images/logo_sci.png"
                                    alt="SCI.AI"
                                    className="h-24 w-auto"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold">Administration SCI.AI</h2>
                                </div>
                                <Button
                                    onClick={() => onSelect('sci-admin')}
                                    className="w-full"
                                    size="default"
                                >
                                    Administrer
                                    <Settings className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Actionnaire Card */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                                    <Building2 className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Actionnaires</h2>
                                </div>
                                <div className="w-full space-y-2">
                                    <Button
                                        onClick={() => onSelect('actionnaire-add')}
                                        className="w-full"
                                        size="default"
                                        variant="default"
                                    >
                                        Ajouter un actionnaire
                                        <UserPlus className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onSelect('actionnaire')}
                                        className="w-full"
                                        size="default"
                                        variant="outline"
                                    >
                                        Gérer les actionnaires
                                        <Building2 className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            );
        }

        if (mainRole === 'ROLE_ACTIONNAIRE') {
            return (
                <>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Espace Actionnaire
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Consultez les rapports et l'évolution de vos investissements
                        </p>
                    </div>

                    <div className="flex justify-center max-w-xl mx-auto">
                        <Card className="hover:shadow-md transition-shadow w-full">
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold">Rapports d'Évolution</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Accédez aux analyses détaillées et aux performances de vos investissements
                                    </p>
                                </div>
                                <Button
                                    onClick={() => onSelect('actionnaire')}
                                    className="w-full"
                                    size="default"
                                >
                                    Consulter les Évolutions
                                    <FileText className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </>
            );
        }

        // Default view for ROLE_DEV, ROLE_LMNP, ROLE_SCI and others
        // Check if user has access to LMNP and/or SCI
        const hasLMNP = currentRole.includes('ROLE_LMNP') || currentRole.includes('ROLE_DEV');
        const hasSCI = currentRole.includes('ROLE_SCI') || currentRole.includes('ROLE_DEV');

        // Determine grid class based on number of apps available
        const gridClass = (hasLMNP && hasSCI)
            ? "grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            : "flex justify-center max-w-md mx-auto";

        return (
            <>
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Choisissez votre application
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Sélectionnez l'outil qui correspond à vos besoins en gestion immobilière
                    </p>
                </div>

                <div className={gridClass}>
                    {/* LMNP.AI Card */}
                    {hasLMNP && (
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <img
                                    src="/medias/images/logo_lmnp.png"
                                    alt="LMNP.AI"
                                    className="h-32 w-auto"
                                />
                                <div>
                                    <h2 className="text-2xl font-semibold">LMNP.AI</h2>
                                </div>
                                <Button
                                    onClick={() => onSelect('lmnp')}
                                    className="w-full"
                                    size="default"
                                >
                                    Accéder à LMNP.AI
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* SCI.AI Card */}
                    {hasSCI && (
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <img
                                    src="/medias/images/logo_sci.png"
                                    alt="SCI.AI"
                                    className="h-32 w-auto"
                                />
                                <div>
                                    <h2 className="text-2xl font-semibold">SCI.AI</h2>
                                </div>
                                <Button
                                    onClick={() => onSelect('sci')}
                                    className="w-full"
                                    size="default"
                                >
                                    Accéder à SCI.AI
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-background pb-16">
            {/* Header */}
            <header className="w-full border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-black rounded-md px-3 py-2 flex items-center justify-center">
                            <img
                                src="/medias/images/logo-a599f4ae.svg"
                                alt="Logo"
                                className="h-6 w-auto"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm text-muted-foreground">
                                Bienvenue, <span className="font-semibold text-foreground">{user?.name || user?.email}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <InstallPWAButton variant="outline" size="sm" />
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
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl space-y-12">
                    {renderContent()}

                    {/* Footer info - Hidden for actionnaires */}
                    {mainRole !== 'ROLE_ACTIONNAIRE' && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Vous pouvez changer d'application à tout moment depuis votre profil
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
