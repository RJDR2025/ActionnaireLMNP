import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone ||
                               document.referrer.includes('android-app://');
            setIsInstalled(isStandalone);
            return isStandalone;
        };

        if (checkInstalled()) {
            return;
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Don't show immediately - wait a bit for better UX
            setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        };

        // Listen for successful installation
        const handleAppInstalled = () => {
            setIsVisible(false);
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Custom event from base.html.twig
        window.addEventListener('app-install-available', () => {
            setIsVisible(true);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ L\'utilisateur a accepté l\'installation');
        } else {
            console.log('❌ L\'utilisateur a refusé l\'installation');
        }

        // Clear the prompt
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Remember dismissal for this session
        sessionStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show if dismissed this session or already installed
    if (!isVisible || isInstalled || sessionStorage.getItem('pwa-install-dismissed')) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background border border-border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-5">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Fermer"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                    <Download className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                        Installer CheckHagnere
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Accédez rapidement à l'application depuis votre écran d'accueil
                    </p>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleInstallClick}
                            size="sm"
                            className="flex-1"
                        >
                            Installer
                        </Button>
                        <Button
                            onClick={handleDismiss}
                            size="sm"
                            variant="outline"
                        >
                            Plus tard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
