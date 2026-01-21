import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { getTransactions } from '../utils/storage';
import { Card } from '../components/Card';
import { Plus, TrendingUp, Tag, History, Wallet } from 'lucide-react-native';
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO, format } from 'date-fns';

const FILTERS = ['Day', 'Week', 'Month', 'Year'];

export default function IncomeScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('Month');
    const [stats, setStats] = useState({ total: 0, mostPurpose: '-', highestAmount: 0 });

    const loadData = async () => {
        const data = await getTransactions();
        // Filter only income
        setTransactions(data.filter(t => t.type === 'income'));
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

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.iconPlaceholder}>
                <Wallet size={20} color={theme.colors.secondary} />
            </View>
            <View style={styles.details}>
                <Text style={styles.purpose}>{item.purpose}</Text>
                <Text style={styles.subDetails}>{format(parseISO(item.date), 'dd MMM')}</Text>
            </View>
            <Text style={styles.amount}>₹{item.amount}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, Platform.OS === 'android' && { marginTop: 40 }]}>
                <Text style={theme.typography.header}>Income</Text>
                <TouchableOpacity onPress={() => navigation.navigate('History', { type: 'income' })} style={styles.iconBtn}>
                    <History color={theme.colors.text} size={24} />
                </TouchableOpacity>
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
                    <Text style={theme.typography.label}>Total Income ({filter})</Text>
                    <Text style={styles.totalAmount}>₹{stats.total.toFixed(2)}</Text>
                </Card>
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Recent Income</Text>
                <FlatList
                    data={filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No income found.</Text>}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
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
        backgroundColor: theme.colors.secondary, // Green for Income
        borderColor: theme.colors.secondary,
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
        borderColor: theme.colors.secondary,
    },
    totalAmount: {
        fontSize: 48,
        fontWeight: '800',
        color: theme.colors.secondary, // Green text
        marginTop: theme.spacing.s,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.m,
    },
    sectionTitle: {
        ...theme.typography.title,
        marginBottom: theme.spacing.m,
    },
    item: {
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
    details: {
        flex: 1,
    },
    purpose: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    subDetails: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.secondary,
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
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.default,
    }
});
