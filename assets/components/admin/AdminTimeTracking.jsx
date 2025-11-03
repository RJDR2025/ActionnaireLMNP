import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { RoleStatusBar } from '@/components/RoleStatusBar';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { Clock, Calendar, ChevronLeft, ChevronRight, LogOut, User, UserPlus, ArrowLeft } from 'lucide-react';

export function AdminTimeTracking({ onLogout, selectedApp, onAppSwitch, onBack, user }) {
    const [currentRole, setCurrentRole] = useState(user?.roles || []);

    const handleRoleChange = (newRoles) => {
        setCurrentRole(newRoles);
    };

    const [entries, setEntries] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

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
            const app = selectedApp === 'lmnp-admin' ? 'lmnp' : 'sci';
            const response = await fetch(
                `/api/time-entries/admin/all?month=${currentMonth}&year=${currentYear}&app=${app}`,
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
        const appPath = selectedApp === 'lmnp-admin' ? '/admin/lmnp_ai' : '/admin/sci_ai';
        window.history.pushState({}, '', appPath);
    }, [currentMonth, currentYear, selectedApp]);

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

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedEntries = [...entries].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Calculate hours by user
    const userHoursSummary = entries.reduce((acc, entry) => {
        const userId = entry.user.id;
        if (!acc[userId]) {
            acc[userId] = {
                user: entry.user,
                totalHours: 0,
                monthlyHours: parseInt(entry.user.monthlyHours) || 140,
            };
        }
        // Convert to number to ensure addition instead of concatenation
        acc[userId].totalHours += parseInt(entry.hours) || 0;
        return acc;
    }, {});

    const userSummaryArray = Object.values(userHoursSummary);

    const appName = selectedApp === 'lmnp-admin' ? 'LMNP.AI' : 'SCI.AI';

    return (
        <div className="min-h-screen bg-background pb-16">
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

                    {/* App Switcher - Center */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onAppSwitch('lmnp-admin')}
                            className={`p-2 rounded-md transition-all ${
                                selectedApp === 'lmnp-admin'
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

                        <button
                            onClick={() => onAppSwitch('sci-admin')}
                            className={`p-2 rounded-md transition-all ${
                                selectedApp === 'sci-admin'
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
                        <h1 className="text-3xl font-bold tracking-tight">
                            Administration {appName}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Suivi des heures de tous les développeurs
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateUserModalOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Créer un utilisateur
                    </Button>
                </div>

                {/* User Hours Summary */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Récapitulatif des heures</CardTitle>
                                <CardDescription>
                                    Heures restantes pour chaque développeur - {months.find(m => m.value === currentMonth)?.label} {currentYear}
                                </CardDescription>
                            </div>
                            {!isLoading && totalHours > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground font-medium">Total équipe</p>
                                        <p className="text-2xl font-bold">{totalHours}h</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                                <p>Chargement des données...</p>
                            </div>
                        ) : userSummaryArray.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    Aucune entrée de temps pour {months.find(m => m.value === currentMonth)?.label} {currentYear}
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userSummaryArray.map((summary) => {
                                    const remainingHours = Math.max(summary.monthlyHours - summary.totalHours, 0);
                                    const percentage = Math.min((summary.totalHours / summary.monthlyHours) * 100, 100);
                                    const isComplete = summary.totalHours >= summary.monthlyHours;

                                    return (
                                        <div key={summary.user.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">
                                                        {summary.user.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {summary.totalHours}h / {summary.monthlyHours}h
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-2">
                                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Remaining Hours Badge */}
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    {isComplete ? 'Objectif atteint ✓' : `Restant: ${remainingHours}h`}
                                                </span>
                                                <span className="font-bold">{Math.round(percentage)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

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

                                <div className="h-6 w-px bg-border mx-2" />

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Total:</span>
                                    <span className="text-xl font-bold">{totalHours}h</span>
                                </div>
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
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Développeur
                                            </th>
                                            <th
                                                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                                                onClick={toggleSortOrder}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Date
                                                    <span className="text-xs">
                                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Heures</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tâches</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedEntries.map((entry) => (
                                            <tr key={entry.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {entry.user.name}
                                                        </span>
                                                    </div>
                                                </td>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateUserModal
                open={isCreateUserModalOpen}
                onOpenChange={setIsCreateUserModalOpen}
                onSuccess={() => {
                    // Optionally refresh data or show a notification
                }}
            />

            {/* <RoleStatusBar currentRole={currentRole} onRoleChange={handleRoleChange} /> */}
        </div>
    );
}
