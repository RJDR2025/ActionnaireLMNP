import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddTimeEntryModal } from './AddTimeEntryModal';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { Plus, Clock, Calendar, Trash2, ChevronLeft, ChevronRight, LogOut, ArrowLeft } from 'lucide-react';

export function TimeTracking({ onLogout, selectedApp, onAppSwitch, user }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

    // Check if user has access to LMNP and/or SCI
    const hasLMNP = currentRole.includes('ROLE_LMNP') || currentRole.includes('ROLE_DEV');
    const hasSCI = currentRole.includes('ROLE_SCI') || currentRole.includes('ROLE_DEV');
    const [entries, setEntries] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [monthlyHours, setMonthlyHours] = useState(user?.monthlyHours || 140);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const months = [
        { value: 1, label: 'Janvier' },
        { value: 2, label: 'Février' },
        { value: 3, label: 'Mars' },
        { value: 4, label: 'Avril' },
        { value: 5, label: 'Mai' },
        { value: 6, label: 'Juin' },
        { value: 7, label: 'Juillet' },
        { value: 8, label: 'Août' },
        { value: 9, label: 'Septembre' },
        { value: 10, label: 'Octobre' },
        { value: 11, label: 'Novembre' },
        { value: 12, label: 'Décembre' },
    ];

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/time-entries?month=${currentMonth}&year=${currentYear}&app=${selectedApp}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setEntries(data.entries);
                setTotalHours(data.totalHours);
                setMonthlyHours(data.monthlyHours || user?.monthlyHours || 140);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
        // Update URL when app changes
        const appPath = selectedApp === 'lmnp' ? '/suivi/lmnp_ai' : '/suivi/sci_ai';
        window.history.pushState({}, '', appPath);
    }, [currentMonth, currentYear, selectedApp]);

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/time-entries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchEntries();
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formatted = new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);

        // Capitalize first letter of day and month
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const handleBackToSelection = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-background pb-16">
            {/* Header */}
            <header className="w-full border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-black rounded-md px-3 py-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => window.location.href = '/'}>
                            <img
                                src="/medias/images/logo-a599f4ae.svg"
                                alt="Logo"
                                className="h-6 w-auto"
                            />
                        </div>
                    </div>

                    {/* App Switcher - Center */}
                    <div className="flex items-center gap-2">
                        {hasLMNP && (
                            <button
                                onClick={() => onAppSwitch('lmnp')}
                                className={`p-2 rounded-md transition-all ${
                                    selectedApp === 'lmnp'
                                        ? 'bg-muted ring-2 ring-ring'
                                        : 'hover:bg-muted'
                                }`}
                            >
                                <img
                                    src="/medias/images/logo_lmnp.png"
                                    alt="LMNP.AI"
                                    className="h-6 w-auto"
                                />
                            </button>
                        )}

                        {hasSCI && (
                            <button
                                onClick={() => onAppSwitch('sci')}
                                className={`p-2 rounded-md transition-all ${
                                    selectedApp === 'sci'
                                        ? 'bg-muted ring-2 ring-ring'
                                        : 'hover:bg-muted'
                                }`}
                            >
                                <img
                                    src="/medias/images/logo_sci.png"
                                    alt="SCI.AI"
                                    className="h-6 w-auto"
                                />
                            </button>
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

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Suivi du temps</h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez vos heures et tâches effectuées
                        </p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une entrée
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Heures ce mois</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours}h</div>
                            <p className="text-xs text-muted-foreground">sur {monthlyHours}h prévues</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Heures restantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.max(monthlyHours - totalHours, 0)}h</div>
                            <p className="text-xs text-muted-foreground">
                                {totalHours >= monthlyHours ? 'Objectif atteint' : 'À compléter'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Progression</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round((totalHours / monthlyHours) * 100)}%
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${Math.min((totalHours / monthlyHours) * 100, 100)}%`
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Entrées de temps</CardTitle>
                                <CardDescription>
                                    {entries.length} entrée{entries.length !== 1 ? 's' : ''} pour{' '}
                                    {months.find(m => m.value === currentMonth)?.label} {currentYear}
                                </CardDescription>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handlePreviousMonth}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <Select
                                    value={currentMonth.toString()}
                                    onValueChange={(value) => setCurrentMonth(parseInt(value))}
                                >
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.value} value={month.value.toString()}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={currentYear.toString()}
                                    onValueChange={(value) => setCurrentYear(parseInt(value))}
                                >
                                    <SelectTrigger className="w-[90px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2024, 2025, 2026].map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleNextMonth}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Chargement...
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    Aucune entrée pour cette période
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Heures</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tâches</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry) => (
                                            <tr key={entry.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {formatDate(entry.date)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold">
                                                            {entry.hours}h
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <ul className="space-y-2">
                                                        {entry.tasks.map((task, index) => {
                                                            // Handle both old format (string) and new format (object with title/description)
                                                            const isOldFormat = typeof task === 'string';
                                                            const title = isOldFormat ? task : task.title;
                                                            const description = isOldFormat ? null : task.description;

                                                            return (
                                                                <li key={index} className="text-sm flex items-start gap-2">
                                                                    <span className="text-muted-foreground mt-0.5">•</span>
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{title}</div>
                                                                        {description && (
                                                                            <div className="text-muted-foreground text-xs mt-0.5">{description}</div>
                                                                        )}
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AddTimeEntryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={fetchEntries}
                selectedApp={selectedApp}
            />

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
