import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../utils/storage';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';
import { PieChart } from 'react-native-svg-charts';
import { isThisMonth, parseISO } from 'date-fns';

export default function OverviewScreen() {
    const [data, setData] = useState({ income: 0, expense: 0, savings: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const transactions = await getTransactions();

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            // Filter for this month mainly, or overall? User mentioned "for this month"
            if (isThisMonth(parseISO(t.date))) {
                if (t.type === 'income') {
                    income += t.amount;
                } else {
                    expense += t.amount;
                }
            }
        });

        setData({
            income,
            expense,
            savings: income - expense
        });
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData().then(() => setRefreshing(false));
    }, []);

    const chartData = [
        {
            key: 1,
            value: data.expense,
            svg: { fill: theme.colors.primary },
            arc: { outerRadius: '100%', innerRadius: '75%' }
        },
        {
            key: 2,
            value: data.income - data.expense > 0 ? data.income - data.expense : 0, // Visualizing savings
            svg: { fill: theme.colors.secondary },
            arc: { outerRadius: '100%', innerRadius: '75%' }
        }
    ];

    // If both are 0, use a gray placeholder
    if (data.income === 0 && data.expense === 0) {
        chartData[0] = { key: 1, value: 100, svg: { fill: theme.colors.surfaceLight }, arc: { outerRadius: '100%', innerRadius: '75%' } };
        chartData.pop();
    }


    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} />
            }
        >
            <View style={styles.header}>
                <Text style={theme.typography.header}>This Month</Text>
            </View>

            <View style={styles.chartContainer}>
                {/* Simple visualization: Savings vs Expense */}
                <View style={styles.chartWrapper}>
                    {/* Note: React Native SVG Charts might be complex to setup perfectly blindly, using simplified view instead if chart fails, but trying chart first */}
                    <View style={styles.circle}>
                        <Text style={styles.savingsLabel}>Savings</Text>
                        <Text style={[styles.savingsValue, { color: data.savings >= 0 ? theme.colors.secondary : theme.colors.danger }]}>
                            ₹{data.savings}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                    <Text style={styles.label}>Income</Text>
                    <Text style={[styles.value, { color: theme.colors.secondary }]}>₹{data.income}</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.label}>Expenses</Text>
                    <Text style={[styles.value, { color: theme.colors.primary }]}>₹{data.expense}</Text>
                </Card>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    {data.income > 0
                        ? `You have saved ${((data.savings / data.income) * 100).toFixed(1)}% of your income this month.`
                        : "Add income to see savings percentage."}
                </Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    header: {
        marginTop: 40,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    chartWrapper: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 10,
        borderColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        elevation: 10,
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    circle: {
        alignItems: 'center',
    },
    savingsLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
    },
    savingsValue: {
        fontSize: 32,
        fontWeight: '800',
        marginTop: theme.spacing.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: theme.spacing.l,
    },
    label: {
        ...theme.typography.label,
        marginBottom: theme.spacing.s,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
    },
    infoContainer: {
        marginTop: theme.spacing.xl,
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
    },
    infoText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
    }
});
