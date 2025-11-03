import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserCog } from 'lucide-react';

const roleLabels = {
    'ROLE_ADMIN': 'Administrateur',
    'ROLE_ACTIONNAIRE': 'Actionnaire',
    'ROLE_DEV': 'Développeur',
    'ROLE_LMNP': 'Développeur LMNP',
    'ROLE_SCI': 'Développeur SCI'
};

const roleColors = {
    'ROLE_ADMIN': 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400',
    'ROLE_ACTIONNAIRE': 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
    'ROLE_DEV': 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    'ROLE_LMNP': 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400',
    'ROLE_SCI': 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-400'
};

export function RoleStatusBar({ currentRole, onRoleChange }) {
    const [isChanging, setIsChanging] = useState(false);

    const handleRoleChange = async (newRole) => {
        setIsChanging(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/user/change-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                const data = await response.json();
                // Reload the page to refresh all components with the new role
                window.location.href = '/';
            } else {
                console.error('Failed to change role');
                alert('Erreur lors du changement de rôle');
            }
        } catch (error) {
            console.error('Error changing role:', error);
            alert('Erreur de connexion au serveur');
        } finally {
            setIsChanging(false);
        }
    };

    // Extract the main role (first one that's not ROLE_USER)
    const mainRole = Array.isArray(currentRole)
        ? currentRole.find(r => r !== 'ROLE_USER') || 'ROLE_USER'
        : currentRole;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 dark:bg-slate-900 border-t border-slate-700 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">
                                Rôle actuel :
                            </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[mainRole]}`}>
                            {roleLabels[mainRole] || mainRole}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <UserCog className="h-4 w-4 text-slate-400" />
                        <Select
                            value={mainRole}
                            onValueChange={handleRoleChange}
                            disabled={isChanging}
                        >
                            <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="Changer de rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ROLE_ADMIN">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        Administrateur
                                    </div>
                                </SelectItem>
                                <SelectItem value="ROLE_ACTIONNAIRE">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Actionnaire
                                    </div>
                                </SelectItem>
                                <SelectItem value="ROLE_DEV">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        Développeur
                                    </div>
                                </SelectItem>
                                <SelectItem value="ROLE_LMNP">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        Développeur LMNP
                                    </div>
                                </SelectItem>
                                <SelectItem value="ROLE_SCI">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                        Développeur SCI
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
