import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';

export function InstallPWAButton({ variant = "default", size = "default", className = "" }) {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://');

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Listen for the custom event dispatched in base.html.twig
        const handleInstallAvailable = () => {
            // Access the deferred prompt from the window object
            if (window.deferredPrompt) {
                setInstallPrompt(window.deferredPrompt);
            }
        };

        // Also listen directly to beforeinstallprompt in case the timing is different
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            window.deferredPrompt = e;
        };

        window.addEventListener('app-install-available', handleInstallAvailable);
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if prompt is already available
        if (window.deferredPrompt) {
            setInstallPrompt(window.deferredPrompt);
        }

        return () => {
            window.removeEventListener('app-install-available', handleInstallAvailable);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            return;
        }

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setIsInstalled(true);
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the prompt
        setInstallPrompt(null);
        window.deferredPrompt = null;
    };

    // Don't show the button if already installed or if prompt is not available
    if (isInstalled) {
        return (
            <Button
                variant={variant}
                size={size}
                className={className}
                disabled
            >
                <Check className="h-4 w-4 mr-2" />
                Application installée
            </Button>
        );
    }

    if (!installPrompt) {
        // Don't show anything if the prompt is not available
        return null;
    }

    return (
        <Button
            onClick={handleInstallClick}
            variant={variant}
            size={size}
            className={className}
        >
            <Download className="h-4 w-4 mr-2" />
            Installer l'application
        </Button>
    );
}
