import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, SafeAreaView, Platform, ScrollView, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { getTransactions, deleteTransaction } from '../utils/storage';
import { ArrowLeft, Trash2, Search, Filter, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react-native';
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO, format, isAfter, isBefore, isEqual, getMonth, getYear } from 'date-fns';

const DATE_PRESETS = ['All', 'Today', 'This Week', 'This Month', 'This Year', 'Custom'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i); // Current year -5 to +5

export default function HistoryScreen({ navigation, route }) {
    const { type } = route.params || {};
    const isExpense = type === 'expense';

    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Detailed Filters
    const [datePreset, setDatePreset] = useState('All');
    const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
    const [endDate, setEndDate] = useState('');     // YYYY-MM-DD
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [purposes, setPurposes] = useState([]);
    const [selectedPurpose, setSelectedPurpose] = useState(null);

    const [people, setPeople] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);

    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const data = await getTransactions();

        // Extract unique Purposes and People for filter dropdowns
        const uniquePurposes = [...new Set(data.map(item => item.purpose).filter(Boolean))];
        const uniquePeople = [...new Set(data.map(item => item.withWhom).filter(Boolean))];

        setPurposes(uniquePurposes);
        setPeople(uniquePeople);
        setTransactions(data);
        applyFilters(data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Apply Filters whenever any filter state changes
    React.useEffect(() => {
        applyFilters(transactions);
    }, [transactions, searchQuery, datePreset, startDate, endDate, selectedMonth, selectedYear, selectedPurpose, selectedPerson]);

    const applyFilters = (data) => {
        let result = data;

        // 1. Type Filter (Income/Expense/All)
        if (type) {
            result = result.filter(e => e.type === type);
        }

        // 2. Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.purpose?.toLowerCase().includes(q) ||
                e.place?.toLowerCase().includes(q) ||
                e.withWhom?.toLowerCase().includes(q) ||
                e.amount.toString().includes(q)
            );
        }

        // 3. Date Filters
        result = result.filter(e => {
            const date = parseISO(e.date);
            switch (datePreset) {
                case 'Today': return isToday(date);
                case 'This Week': return isThisWeek(date);
                case 'This Month': return isThisMonth(date);
                case 'This Year': return isThisYear(date);
                case 'Custom':
                    if (startDate && endDate) {
                        const start = parseISO(startDate);
                        const end = parseISO(endDate);
                        // Simple check: start <= date <= end
                        // Note: string comparison works for ISO dates too if formatted correctly
                        return (isAfter(date, start) || isEqual(date, start)) &&
                            (isBefore(date, end) || isEqual(date, end));
                    } else if (selectedMonth !== null && selectedYear !== null) {
                        return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
                    }
                    return true;
                default: return true;
            }
        });

        // 4. Purpose Filter
        if (selectedPurpose) {
            result = result.filter(e => e.purpose === selectedPurpose);
        }

        // 5. Person Filter
        if (selectedPerson) {
            result = result.filter(e => e.withWhom === selectedPerson);
        }

        setFilteredData(result);
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updated = await deleteTransaction(id);
                            // Only update main list, effect will update filtered list
                            const newTxns = transactions.filter(t => t.id !== id);
                            setTransactions(newTxns);
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isInc = item.type === 'income';
        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.purpose}>{item.purpose}</Text>
                        <Text style={styles.details}>
                            {item.place ? `${item.place} • ` : ''}{item.withWhom}
                        </Text>
                        <Text style={styles.date}>{format(parseISO(item.date), 'dd MMM yyyy, hh:mm a')}</Text>
                    </View>
                    <View style={styles.amountColumn}>
                        <Text style={[styles.amount, { color: isInc ? theme.colors.secondary : theme.colors.danger }]}>
                            {isInc ? '+' : '-'}₹{item.amount}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                            <Trash2 size={20} color={theme.colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const FilterModal = () => (
        <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <X color={theme.colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>

                        {/* Date Preset */}
                        <Text style={styles.filterLabel}>Date Range</Text>
                        <View style={styles.pillsContainer}>
                            {DATE_PRESETS.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.pill, datePreset === p && styles.pillActive]}
                                    onPress={() => {
                                        setDatePreset(p);
                                        // Reset custom fields when standard preset selected
                                        if (p !== 'Custom') {
                                            setStartDate('');
                                            setEndDate('');
                                        }
                                    }}
                                >
                                    <Text style={[styles.pillText, datePreset === p && styles.pillTextActive]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Date Inputs */}
                        {datePreset === 'Custom' && (
                            <View style={styles.customDateContainer}>
                                <Text style={styles.subLabel}>Or Select Specific Month</Text>
                                <View style={styles.row}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                        {MONTHS.map((m, index) => (
                                            <TouchableOpacity
                                                key={m}
                                                style={[styles.pill, selectedMonth === index && styles.pillActive]}
                                                onPress={() => setSelectedMonth(index)}
                                            >
                                                <Text style={[styles.pillText, selectedMonth === index && styles.pillTextActive]}>{m}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                                <View style={styles.row}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {YEARS.map((y) => (
                                            <TouchableOpacity
                                                key={y}
                                                style={[styles.pill, selectedYear === y && styles.pillActive]}
                                                onPress={() => setSelectedYear(y)}
                                            >
                                                <Text style={[styles.pillText, selectedYear === y && styles.pillTextActive]}>{y}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <Text style={[styles.subLabel, { marginTop: 15 }]}>Or Custom Range (YYYY-MM-DD)</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        style={styles.dateInput}
                                        placeholder="Start Date"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={startDate}
                                        onChangeText={setStartDate}
                                    />
                                    <View style={{ width: 10 }} />
                                    <TextInput
                                        style={styles.dateInput}
                                        placeholder="End Date"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={endDate}
                                        onChangeText={setEndDate}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Purpose Filter */}
                        <Text style={styles.filterLabel}>Purpose</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                            <TouchableOpacity
                                style={[styles.pill, selectedPurpose === null && styles.pillActive]}
                                onPress={() => setSelectedPurpose(null)}
                            >
                                <Text style={[styles.pillText, selectedPurpose === null && styles.pillTextActive]}>All</Text>
                            </TouchableOpacity>
                            {purposes.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.pill, selectedPurpose === p && styles.pillActive]}
                                    onPress={() => setSelectedPurpose(p)}
                                >
                                    <Text style={[styles.pillText, selectedPurpose === p && styles.pillTextActive]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Person Filter - Only relevant for Expenses usually, but logic works for both */}
                        <Text style={styles.filterLabel}>With Whom</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                            <TouchableOpacity
                                style={[styles.pill, selectedPerson === null && styles.pillActive]}
                                onPress={() => setSelectedPerson(null)}
                            >
                                <Text style={[styles.pillText, selectedPerson === null && styles.pillTextActive]}>All</Text>
                            </TouchableOpacity>
                            {people.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.pill, selectedPerson === p && styles.pillActive]}
                                    onPress={() => setSelectedPerson(p)}
                                >
                                    <Text style={[styles.pillText, selectedPerson === p && styles.pillTextActive]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                            <Text style={styles.applyBtnText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, Platform.OS === 'android' && { marginTop: 40 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={theme.typography.title}>{type === 'income' ? 'Income History' : 'Expense History'}</Text>

                <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterBtnHeader}>
                    <Filter color={theme.colors.text} size={20} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Active Filters Summary (Optional) */}
            {(datePreset !== 'All' || selectedPurpose || selectedPerson) && (
                <View style={styles.activeFilters}>
                    <Text style={styles.activeFilterText}>
                        Filters: {datePreset}
                        {selectedPurpose ? `, ${selectedPurpose}` : ''}
                        {selectedPerson ? `, ${selectedPerson}` : ''}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        setDatePreset('All');
                        setSelectedPurpose(null);
                        setSelectedPerson(null);
                    }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12 }}>Clear</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* List */}
            <FlatList
                style={{ flex: 1 }}
                data={filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No transactions found matching your criteria.</Text>
                }
            />

            <FilterModal />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.m,
    },
    iconBtn: {
        padding: theme.spacing.s,
    },
    filterBtnHeader: {
        padding: theme.spacing.s,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        height: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchIcon: {
        marginRight: theme.spacing.s,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
    },
    activeFilters: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        marginTop: 10,
    },
    activeFilterText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
    listContent: {
        padding: theme.spacing.m,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
        padding: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.subtle,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoColumn: {
        flex: 1,
    },
    amountColumn: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
    },
    purpose: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 2,
    },
    details: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    date: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.success,
    },
    deleteBtn: {
        padding: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xl,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: theme.spacing.m,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    modalBody: {
        flex: 1,
    },
    filterLabel: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginTop: theme.spacing.m,
        marginBottom: theme.spacing.s,
    },
    subLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pillsScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: 8,
        marginBottom: 8,
    },
    pillActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    pillText: {
        color: theme.colors.textSecondary,
    },
    pillTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    customDateContainer: {
        backgroundColor: theme.colors.surface,
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInput: {
        flex: 1,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalFooter: {
        paddingTop: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    applyBtn: {
        backgroundColor: theme.colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
