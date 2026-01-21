import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, SafeAreaView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { getTransactions, deleteTransaction } from '../utils/storage';
import { ArrowLeft, Trash2, Search, Filter } from 'lucide-react-native';
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO, format } from 'date-fns';

const DATE_FILTERS = ['All', 'Day', 'Week', 'Month', 'Year'];

export default function HistoryScreen({ navigation, route }) {
    const { type } = route.params || {}; // Filter by type if provided
    const [transactions, setTransactions] = useState([]); // Renamed from expenses
    const [dateFilter, setDateFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const getFilteredExpenses = () => {
        return transactions.filter(e => {
            // Type Filter (if provided from navigation)
            if (type && e.type !== type) return false;

            // Date Filter
            const date = parseISO(e.date);
            let dateMatch = true;
            switch (dateFilter) {
                case 'Day': dateMatch = isToday(date); break;
                case 'Week': dateMatch = isThisWeek(date); break;
                case 'Month': dateMatch = isThisMonth(date); break;
                case 'Year': dateMatch = isThisYear(date); break;
                default: dateMatch = true;
            }

            // Search Filter
            const q = searchQuery.toLowerCase();
            const searchMatch = !searchQuery ||
                e.purpose.toLowerCase().includes(q) ||
                (e.place && e.place.toLowerCase().includes(q)) ||
                e.withWhom.toLowerCase().includes(q) ||
                e.amount.toString().includes(q);

            return dateMatch && searchMatch;
        });
    };

    const filteredData = getFilteredExpenses();

    const renderItem = ({ item }) => {
        const isIncome = item.type === 'income';
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
                        <Text style={[styles.amount, { color: isIncome ? theme.colors.secondary : theme.colors.danger }]}>
                            {isIncome ? '+' : '-'}₹{item.amount}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                            <Trash2 size={20} color={theme.colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
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
                            setTransactions(updated);
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, Platform.OS === 'android' && { marginTop: 40 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={theme.typography.title}>History</Text>
                <View style={{ width: 40 }} />
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

            {/* Filters */}
            <View style={styles.filtersWrapper}>
                <FlatList
                    horizontal
                    data={DATE_FILTERS}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.filterPill, dateFilter === item && styles.filterPillActive]}
                            onPress={() => setDateFilter(item)}
                        >
                            <Text style={[styles.filterText, dateFilter === item && styles.filterTextActive]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

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
    filtersWrapper: {
        marginTop: theme.spacing.m,
        height: 50,
    },
    filtersContainer: {
        paddingHorizontal: theme.spacing.m,
        gap: theme.spacing.s,
    },
    filterPill: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
    },
    filterPillActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: theme.spacing.m,
        paddingBottom: 100, // Ensure last item is visible above any potential floating elements or bottom safe area
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s, // Reduced margin
        padding: theme.spacing.s,      // Reduced padding
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
        justifyContent: 'center', // Changed from space-between to center for compact view
        gap: 8, // Use gap instead of space-between
    },
    purpose: {
        fontSize: 14, // Reduced font size
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 2,
    },
    details: {
        fontSize: 12, // Reduced font size
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    date: {
        fontSize: 10, // Reduced font size
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    amount: {
        fontSize: 16, // Reduced font size
        fontWeight: '800',
        color: theme.colors.success,
    },
    deleteBtn: {
        padding: 4, // Reduced padding
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xl,
    }
});
