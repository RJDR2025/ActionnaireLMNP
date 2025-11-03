import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function RegisterForm({ onRegister, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const getPasswordStrength = () => {
        if (!password) return { strength: 0, text: '', color: '' };
        const length = password.length;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        let strength = 0;
        if (length >= 6) strength++;
        if (length >= 8) strength++;
        if (hasLetter && hasNumber) strength++;
        if (hasSpecial) strength++;

        const levels = [
            { text: 'Trop faible', color: 'bg-red-500' },
            { text: 'Faible', color: 'bg-orange-500' },
            { text: 'Moyen', color: 'bg-yellow-500' },
            { text: 'Fort', color: 'bg-green-500' },
            { text: 'Très fort', color: 'bg-green-600' }
        ];

        return { strength, ...levels[strength] };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onRegister();
                }, 2000);
            } else {
                setError(data.error || 'Échec de l\'inscription');
            }
        } catch (err) {
            setError('Erreur réseau. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center mb-2">
                    <img
                        src="/medias/images/logo-a599f4ae.svg"
                        alt="Logo"
                        className="h-20 w-auto"
                    />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
                    <p className="text-muted-foreground">
                        Rejoignez-nous et commencez votre aventure
                    </p>
                </div>
            </div>

            <Card className="border-2 shadow-lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl">Inscription</CardTitle>
                        <CardDescription>
                            Remplissez le formulaire pour créer votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success" className="animate-in slide-in-from-top-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>
                                    Compte créé avec succès ! Redirection vers la connexion...
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nom complet
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Jean Dupont"
                                    className="pl-10 h-11"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="register-email" className="text-sm font-medium">
                                Adresse email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="register-email"
                                    type="email"
                                    placeholder="nom@example.com"
                                    className="pl-10 h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="register-password" className="text-sm font-medium">
                                Mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="register-password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                            {password && (
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${
                                                    i < passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : 'bg-muted'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Force : {passwordStrength.text}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-medium">
                                Confirmer le mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                            {confirmPassword && (
                                <div className="flex items-center gap-2 text-xs">
                                    {password === confirmPassword ? (
                                        <>
                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            <span className="text-green-600">Les mots de passe correspondent</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-3 w-3 text-destructive" />
                                            <span className="text-destructive">Les mots de passe ne correspondent pas</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création du compte...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Compte créé !
                                </>
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Déjà inscrit ?
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11"
                            onClick={onSwitchToLogin}
                            disabled={loading || success}
                        >
                            Se connecter
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
                En créant un compte, vous acceptez nos{' '}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Politique de confidentialité
                </a>
            </p>
        </div>
    );
}
