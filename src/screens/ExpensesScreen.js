import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { getTransactions, exportToExcel } from '../utils/storage';
import { Card } from '../components/Card';
import { Plus, Download, TrendingUp, Tag, History } from 'lucide-react-native';
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO, format } from 'date-fns';

const FILTERS = ['Day', 'Week', 'Month', 'Year'];

export default function ExpensesScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('Month');
    const [stats, setStats] = useState({ total: 0, mostPurpose: '-', highestAmount: 0 });

    const loadData = async () => {
        const data = await getTransactions();
        // Filter only expenses
        setTransactions(data.filter(t => t.type === 'expense' || !t.type));
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const getFilteredData = () => {
        return transactions.filter(e => {
            const date = parseISO(e.date);
            switch (filter) {
                case 'Day': return isToday(date);
                case 'Week': return isThisWeek(date);
                case 'Month': return isThisMonth(date);
                case 'Year': return isThisYear(date);
                default: return true;
            }
        });
    };

    const filteredData = getFilteredData();

    React.useEffect(() => {
        if (filteredData.length === 0) {
            setStats({ total: 0, mostPurpose: '-', highestAmount: 0 });
            return;
        }

        const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
        const highest = Math.max(...filteredData.map(item => item.amount));

        const purposeCounts = {};
        filteredData.forEach(item => {
            purposeCounts[item.purpose] = (purposeCounts[item.purpose] || 0) + 1;
        });

        const keys = Object.keys(purposeCounts);
        const mostPurpose = keys.length > 0
            ? keys.reduce((a, b) => purposeCounts[a] > purposeCounts[b] ? a : b)
            : '-';

        setStats({ total, mostPurpose, highestAmount: highest });
    }, [transactions, filter]);

    const handleExport = async () => {
        try {
            const success = await exportToExcel();
            if (success) {
                Alert.alert("Success", "File exported and ready to share.");
            }
        } catch (e) {
            Alert.alert("Error", "Failed to export file.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.expenseItem}>
            <View style={styles.iconPlaceholder}>
                <Tag size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.expenseDetails}>
                <Text style={styles.expensePurpose}>{item.purpose}</Text>
                <Text style={styles.expenseSubDetails}>{item.place || item.withWhom} • {format(parseISO(item.date), 'dd MMM')}</Text>
            </View>
            <Text style={styles.expenseAmount}>₹{item.amount}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, Platform.OS === 'android' && { marginTop: 40 }]}>
                <Text style={theme.typography.header}>Expenses</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('History', { type: 'expense' })} style={styles.iconBtn}>
                        <History color={theme.colors.text} size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabs}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.tab, filter === f && styles.tabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.summaryContainer}>
                <Card style={styles.summaryCard}>
                    <Text style={theme.typography.label}>Total Spent ({filter})</Text>
                    <Text style={styles.totalAmount}>₹{stats.total.toFixed(2)}</Text>
                </Card>
            </View>

            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <TrendingUp size={20} color={theme.colors.secondary} style={{ marginBottom: 8 }} />
                    <Text style={theme.typography.caption}>Highest</Text>
                    <Text style={styles.statValue}>₹{stats.highestAmount}</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Tag size={20} color={theme.colors.accent} style={{ marginBottom: 8 }} />
                    <Text style={theme.typography.caption}>Frequent</Text>
                    <Text style={styles.statValue}>{stats.mostPurpose}</Text>
                </Card>
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
                <FlatList
                    data={filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No expenses found.</Text>}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
            >
                <Plus size={32} color="#FFFFFF" />
            </TouchableOpacity>

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    iconBtn: {
        padding: theme.spacing.s,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.round,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
        gap: theme.spacing.s,
    },
    tab: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tabActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    summaryContainer: {
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    summaryCard: {
        alignItems: 'center',
        paddingVertical: theme.spacing.l,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    totalAmount: {
        fontSize: 48,
        fontWeight: '800',
        color: theme.colors.text,
        marginTop: theme.spacing.s,
    },
    statsRow: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    statCard: {
        flex: 1,
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.m,
    },
    sectionTitle: {
        ...theme.typography.title,
        marginBottom: theme.spacing.m,
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    expenseDetails: {
        flex: 1,
    },
    expensePurpose: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    expenseSubDetails: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xl,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.default,
    }
});
