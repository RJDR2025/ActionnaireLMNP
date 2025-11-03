import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, RotateCcw, Save } from 'lucide-react';

export function MonthlyHoursPlanningModal({ open, onOpenChange, user, selectedApp }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthsData, setMonthsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [defaultHours, setDefaultHours] = useState(140);
    const [modifiedMonths, setModifiedMonths] = useState(new Set());

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const fetchPlanning = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const app = selectedApp === 'lmnp-admin' ? 'lmnp' : 'sci';
            const response = await fetch(`/api/hours-planning/user/${user.id}/year/${year}?app=${app}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMonthsData(data.months);
                setDefaultHours(data.user.defaultMonthlyHours);
                setModifiedMonths(new Set()); // Reset modified months when loading data
            }
        } catch (error) {
            console.error('Error fetching planning:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && user) {
            fetchPlanning();
        }
    }, [open, user, year, selectedApp]);

    const handleHoursChange = (monthIndex, value) => {
        const newMonthsData = [...monthsData];
        newMonthsData[monthIndex] = {
            ...newMonthsData[monthIndex],
            hours: parseInt(value) || 0,
        };
        setMonthsData(newMonthsData);

        // Mark this month as modified
        setModifiedMonths(prev => new Set(prev).add(monthIndex));
    };

    const handleSaveMonth = async (monthData, monthIndex = null) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const app = selectedApp === 'lmnp-admin' ? 'lmnp' : 'sci';
            const response = await fetch(`/api/hours-planning/user/${user.id}/month`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    month: monthData.month,
                    year: year,
                    hours: monthData.hours,
                    app: app,
                }),
            });

            if (response.ok) {
                // Remove this month from modified months if saved individually
                if (monthIndex !== null) {
                    setModifiedMonths(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(monthIndex);
                        return newSet;
                    });
                }
                fetchPlanning(); // Refresh
            }
        } catch (error) {
            console.error('Error saving planning:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetMonth = async (monthData) => {
        if (!confirm(`Réinitialiser ${monthNames[monthData.month - 1]} aux heures par défaut (${defaultHours}h) ?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const app = selectedApp === 'lmnp-admin' ? 'lmnp' : 'sci';
            const response = await fetch(
                `/api/hours-planning/user/${user.id}/month/${monthData.month}/year/${year}?app=${app}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchPlanning(); // Refresh
            }
        } catch (error) {
            console.error('Error resetting planning:', error);
        }
    };

    const handleSaveAll = async () => {
        if (modifiedMonths.size === 0) {
            return; // Button should be disabled, but just in case
        }

        setIsSaving(true);
        // Only save months that have been modified
        for (const monthIndex of modifiedMonths) {
            await handleSaveMonth(monthsData[monthIndex]);
        }
        setModifiedMonths(new Set()); // Clear modified months after saving
        setIsSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl">Planifier les heures mensuelles</DialogTitle>
                    <DialogDescription>
                        {user && (
                            <span className="text-sm">
                                Configuration pour <strong>{user.name}</strong> - Par défaut: {defaultHours}h/mois
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-6 py-4 overflow-y-auto flex-1">
                    {/* Year Selector */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Année:</label>
                        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026, 2027].map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Months Table */}
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-600">
                            <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2 animate-spin" />
                            <p className="text-sm">Chargement...</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-3 font-medium text-gray-700">Mois</th>
                                            <th className="text-center py-2 px-3 font-medium text-gray-700">Heures</th>
                                            <th className="text-center py-2 px-3 font-medium text-gray-700">État</th>
                                            <th className="text-center py-2 px-3 font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthsData.map((monthData, index) => (
                                            <tr key={monthData.month} className="border-t hover:bg-gray-50">
                                                <td className="py-2 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-gray-500" />
                                                        <span className="font-medium text-gray-900">{monthNames[monthData.month - 1]}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={monthData.hours}
                                                        onChange={(e) => handleHoursChange(index, e.target.value)}
                                                        className="w-20 h-8 text-sm mx-auto text-center"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    {monthData.isCustom ? (
                                                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                                            Personnalisé
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                                            Par défaut
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSaveMonth(monthData, index)}
                                                            disabled={isSaving}
                                                            className="h-7 w-7 p-0"
                                                            title="Enregistrer"
                                                        >
                                                            <Save className="h-3.5 w-3.5" />
                                                        </Button>
                                                        {monthData.isCustom && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleResetMonth(monthData)}
                                                                disabled={isSaving}
                                                                className="h-7 w-7 p-0"
                                                                title="Réinitialiser"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* Save All Button */}
                <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
                    <Button
                        onClick={handleSaveAll}
                        disabled={isSaving || modifiedMonths.size === 0}
                        size="sm"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving
                            ? 'Enregistrement...'
                            : modifiedMonths.size > 0
                                ? `Enregistrer ${modifiedMonths.size} mois modifié${modifiedMonths.size > 1 ? 's' : ''}`
                                : 'Aucune modification'
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
