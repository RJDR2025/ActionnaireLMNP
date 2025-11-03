import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export function LoginForm({
  className,
  onLogin,
  onSwitchToRegister,
  ...props
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token
        localStorage.setItem('token', data.token);
        onLogin(data.token);
      } else {
        setError(data.message || 'Échec de la connexion');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Bon retour</h1>
                <p className="text-muted-foreground text-balance">
                  Connectez-vous à votre compte
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Pas encore de compte ?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitchToRegister?.();
                  }}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  S'inscrire
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-black relative hidden md:flex md:items-center md:justify-center">
            <img
              src="/medias/images/logo-a599f4ae.svg"
              alt="Logo"
              className="h-full w-full object-contain p-12"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En continuant, vous acceptez nos{' '}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Conditions d'utilisation
        </a>{' '}
        et notre{' '}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Politique de confidentialité
        </a>.
      </FieldDescription>
    </div>
  );
}
