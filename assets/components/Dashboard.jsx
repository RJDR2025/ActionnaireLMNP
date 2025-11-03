import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Dashboard({ onLogout, selectedApp }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');

    const appNames = {
        lmnp: 'LMNP.AI',
        sci: 'SCI.AI'
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            setError('Non authentifié');
            setLoading(false);
            return;
        }

        setToken(storedToken);

        try {
            const response = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setError('Erreur de récupération des données utilisateur');
                // Token might be invalid, logout
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    onLogout();
                }
            }
        } catch (err) {
            setError('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Erreur</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleLogout} variant="outline">
                            Retour à la connexion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8 px-8">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{appNames[selectedApp] || 'Tableau de bord'}</h1>
                        <p className="text-purple-100 mt-1">
                            Bienvenue, {user?.name || user?.email}
                        </p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="secondary"
                    >
                        Se déconnecter
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-6">
                <Alert variant="success">
                    <AlertTitle>✓ Authentifié avec succès</AlertTitle>
                    <AlertDescription>
                        Vous êtes connecté avec un JWT. Le token est stocké dans localStorage.
                    </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du compte</CardTitle>
                            <CardDescription>
                                Vos détails de profil
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                                <p className="text-lg">{user?.name || 'Non défini'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-lg">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rôles</p>
                                <div className="flex gap-2 mt-1">
                                    {user?.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                            <CardDescription>
                                Informations sur votre activité
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                <span className="text-sm font-medium">ID Utilisateur</span>
                                <span className="text-2xl font-bold text-primary">{user?.id}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <span className="text-sm font-medium">Statut</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    ✓ Actif
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations JWT</CardTitle>
                        <CardDescription>
                            Votre token d'authentification (pour débogage)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Token JWT</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">
                                {token}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-2">Comment vérifier l'authentification :</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Ouvrez les DevTools (F12) → Application → Local Storage</li>
                                <li>Vérifiez la présence de la clé "token"</li>
                                <li>Inspectez les requêtes réseau pour voir le header Authorization</li>
                                <li>Décodez le JWT sur <a href="https://jwt.io" target="_blank" className="text-primary underline">jwt.io</a></li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <footer className="bg-slate-800 text-white text-center py-6 mt-auto">
                <p>© 2025 - Application sécurisée avec JWT</p>
            </footer>
        </div>
    );
}
