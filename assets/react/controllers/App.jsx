import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AppSelection } from '@/components/AppSelection';
import { Dashboard } from '@/components/Dashboard';
import { TimeTracking } from '@/components/dev/TimeTracking';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminTimeTracking } from '@/components/admin/AdminTimeTracking';
import { UserManagement } from '@/components/admin/UserManagement';
import { ActionnaireDashboard } from '@/components/actionnaire/ActionnaireDashboard';
import { ActionnaireManagement } from '@/components/actionnaire/ActionnaireManagement';
import { InstallPWA } from '@/components/InstallPWA';

export default function App(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [adminPage, setAdminPage] = useState(null); // null = dashboard, 'time-tracking', 'users'
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Parse URL to determine initial app and page
    const parseCurrentUrl = () => {
        const path = window.location.pathname;

        // Admin routes
        if (path.startsWith('/admin/lmnp_ai')) {
            if (path.includes('/time-tracking')) return { app: 'lmnp-admin', page: 'time-tracking' };
            if (path.includes('/users')) return { app: 'lmnp-admin', page: 'users' };
            return { app: 'lmnp-admin', page: null };
        }
        if (path.startsWith('/admin/sci_ai')) {
            if (path.includes('/time-tracking')) return { app: 'sci-admin', page: 'time-tracking' };
            if (path.includes('/users')) return { app: 'sci-admin', page: 'users' };
            return { app: 'sci-admin', page: null };
        }

        // Suivi routes
        if (path === '/suivi/lmnp_ai') return { app: 'lmnp', page: null };
        if (path === '/suivi/sci_ai') return { app: 'sci', page: null };

        // Actionnaire routes
        if (path === '/actionnaires/ajouter') return { app: 'actionnaire-add', page: null };
        if (path === '/actionnaires') return { app: 'actionnaire', page: null };

        // Default
        return { app: null, page: null };
    };

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            fetchUserData(token);

            // Parse URL and set initial state
            const { app, page } = parseCurrentUrl();
            setSelectedApp(app);
            setAdminPage(page);
        } else {
            setLoading(false);
        }

        // Handle browser back/forward buttons
        const handlePopState = (event) => {
            const { app, page } = parseCurrentUrl();
            setSelectedApp(app);
            setAdminPage(page);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (token) => {
        setIsAuthenticated(true);
        fetchUserData(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setSelectedApp(null);
        setAdminPage(null);
        setUser(null);
        window.history.pushState({}, '', '/');
    };

    const handleRegister = () => {
        // After successful registration, switch to login
        setShowRegister(false);
    };

    const handleAppSelect = (app, page = null) => {
        const isCurrentlyAdmin = selectedApp === 'lmnp-admin' || selectedApp === 'sci-admin';
        const isNewAppAdmin = app === 'lmnp-admin' || app === 'sci-admin';

        // Only reset adminPage if switching between admin and non-admin contexts
        if (isCurrentlyAdmin !== isNewAppAdmin) {
            setAdminPage(null);
        }

        setSelectedApp(app);
        setAdminPage(page);

        // Update URL when app is selected
        let appPath = '/';

        if (app === 'lmnp' || app === 'sci') {
            appPath = app === 'lmnp' ? '/suivi/lmnp_ai' : '/suivi/sci_ai';
        } else if (app === 'lmnp-admin' || app === 'sci-admin') {
            const basePath = app === 'lmnp-admin' ? '/admin/lmnp_ai' : '/admin/sci_ai';
            if (page === 'time-tracking') {
                appPath = `${basePath}/time-tracking`;
            } else if (page === 'users') {
                appPath = `${basePath}/users`;
            } else {
                appPath = basePath;
            }
        } else if (app === 'actionnaire-add') {
            appPath = '/actionnaires/ajouter';
        } else if (app === 'actionnaire') {
            appPath = '/actionnaires';
        }

        window.history.pushState({ app, page }, '', appPath);
    };

    const handleAdminNavigate = (page) => {
        setAdminPage(page);

        // Update URL
        const basePath = selectedApp === 'lmnp-admin' ? '/admin/lmnp_ai' : '/admin/sci_ai';
        let appPath = basePath;

        if (page === 'time-tracking') {
            appPath = `${basePath}/time-tracking`;
        } else if (page === 'users') {
            appPath = `${basePath}/users`;
        }

        window.history.pushState({ app: selectedApp, page }, '', appPath);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        // Check user roles
        const userRoles = user?.roles || [];
        const isAdmin = userRoles.includes('ROLE_ADMIN');
        const isActionnaire = userRoles.includes('ROLE_ACTIONNAIRE');
        const hasLMNP = userRoles.includes('ROLE_LMNP') || userRoles.includes('ROLE_DEV');
        const hasSCI = userRoles.includes('ROLE_SCI') || userRoles.includes('ROLE_DEV');

        if (!selectedApp) {
            return <AppSelection onSelect={handleAppSelect} onLogout={handleLogout} user={user} />;
        }

        // For admins (LMNP or SCI admin), show admin interface
        if (selectedApp === 'lmnp-admin' || selectedApp === 'sci-admin') {
            // Security check: Only admins can access admin pages
            if (!isAdmin) {
                setSelectedApp(null);
                setAdminPage(null);
                alert('Accès refusé : vous devez être administrateur');
                window.history.pushState({}, '', '/');
                return <AppSelection onSelect={handleAppSelect} onLogout={handleLogout} user={user} />;
            }
            // Show time tracking page
            if (adminPage === 'time-tracking') {
                return (
                    <AdminTimeTracking
                        onLogout={handleLogout}
                        selectedApp={selectedApp}
                        onAppSwitch={handleAppSelect}
                        onBack={() => setAdminPage(null)}
                        user={user}
                    />
                );
            }

            // Show user management page
            if (adminPage === 'users') {
                return (
                    <UserManagement
                        onLogout={handleLogout}
                        selectedApp={selectedApp}
                        onBack={() => setAdminPage(null)}
                        user={user}
                    />
                );
            }

            // Show admin dashboard by default
            return (
                <AdminDashboard
                    onLogout={handleLogout}
                    selectedApp={selectedApp}
                    onNavigate={handleAdminNavigate}
                    onBack={() => setSelectedApp(null)}
                    user={user}
                />
            );
        }

        // For actionnaire section
        if (selectedApp === 'actionnaire' || selectedApp === 'actionnaire-add') {
            // Security check: Only admins and actionnaires can access these pages
            if (!isAdmin && !isActionnaire) {
                setSelectedApp(null);
                alert('Accès refusé : vous devez être administrateur ou actionnaire');
                window.history.pushState({}, '', '/');
                return <AppSelection onSelect={handleAppSelect} onLogout={handleLogout} user={user} />;
            }

            // Determine if we should open the add modal
            const shouldOpenAddModal = selectedApp === 'actionnaire-add';

            // Show actionnaires management page directly for admin users
            if (isAdmin || adminPage === 'actionnaires') {
                return (
                    <ActionnaireManagement
                        onLogout={handleLogout}
                        onBack={() => setSelectedApp(null)}
                        user={user}
                        openAddModal={shouldOpenAddModal}
                    />
                );
            }

            // Show actionnaire dashboard by default for non-admin users
            return (
                <ActionnaireDashboard
                    onLogout={handleLogout}
                    onNavigate={handleAdminNavigate}
                    onBack={() => setSelectedApp(null)}
                    user={user}
                />
            );
        }

        // For developers (LMNP or SCI), show TimeTracking
        if (selectedApp === 'lmnp' || selectedApp === 'sci') {
            // Security check: Verify user has access to the selected app
            const hasAccess = (selectedApp === 'lmnp' && hasLMNP) || (selectedApp === 'sci' && hasSCI);

            if (!hasAccess) {
                setSelectedApp(null);
                alert(`Accès refusé : vous n'avez pas accès à ${selectedApp === 'lmnp' ? 'LMNP.AI' : 'SCI.AI'}`);
                window.history.pushState({}, '', '/');
                return <AppSelection onSelect={handleAppSelect} onLogout={handleLogout} user={user} />;
            }

            return (
                <>
                    <TimeTracking onLogout={handleLogout} selectedApp={selectedApp} onAppSwitch={handleAppSelect} user={user} />
                    <InstallPWA />
                </>
            );
        }

        return (
            <>
                <Dashboard onLogout={handleLogout} selectedApp={selectedApp} />
                <InstallPWA />
            </>
        );
    }

    return (
        <div className="bg-white flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                {showRegister ? (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchToLogin={() => setShowRegister(false)}
                    />
                ) : (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchToRegister={() => setShowRegister(true)}
                    />
                )}
            </div>
        </div>
    );
}
