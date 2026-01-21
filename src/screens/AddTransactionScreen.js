import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../utils/theme';
import { Button } from '../components/Button';
import { saveTransaction } from '../utils/storage';
import { ArrowLeft } from 'lucide-react-native';

const EXPENSE_PURPOSES = ['Food', 'Travelling', 'Tea/Coffee', 'Movie', 'Entertainment', 'Shopping', 'Others'];
const INCOME_SOURCES = ['Job', 'Bonus', 'Shares', 'Stock', 'Others'];
const WITH_WHOM = ['Self', 'Family', 'Relatives', 'Friends', 'Unknown'];

export default function AddTransactionScreen({ navigation, route }) {
    const { type } = route.params || { type: 'expense' }; // 'income' or 'expense'
    const isIncome = type === 'income';

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(isIncome ? INCOME_SOURCES[0] : EXPENSE_PURPOSES[0]);
    const [withWhom, setWithWhom] = useState(WITH_WHOM[0]);
    const [place, setPlace] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        setLoading(true);
        const newTransaction = {
            id: Date.now().toString(),
            type: type,
            amount: parseFloat(amount),
            purpose: category, // Using 'purpose' field for both consistently
            withWhom: isIncome ? 'Self' : withWhom, // Income is usually Self, but we can keep structure
            place: place,
            date: new Date().toISOString(),
        };

        try {
            await saveTransaction(newTransaction);
            setLoading(false);
            navigation.goBack();
        } catch (e) {
            setLoading(false);
            Alert.alert('Error', 'Failed to save transaction');
        }
    };

    const categories = isIncome ? INCOME_SOURCES : EXPENSE_PURPOSES;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={theme.typography.header}>{isIncome ? 'Add Income' : 'Add Expense'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.label}>Amount</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                <Text style={styles.label}>{isIncome ? 'Source' : 'Purpose'}</Text>
                <View style={styles.pills}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.pill, category === cat && styles.pillActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {!isIncome && (
                    <>
                        <Text style={styles.label}>With Whom</Text>
                        <View style={styles.pills}>
                            {WITH_WHOM.map(w => (
                                <TouchableOpacity
                                    key={w}
                                    style={[styles.pill, withWhom === w && styles.pillActive]}
                                    onPress={() => setWithWhom(w)}
                                >
                                    <Text style={[styles.pillText, withWhom === w && styles.pillTextActive]}>{w}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <Text style={styles.label}>{isIncome ? 'Note (Optional)' : 'Place/Shop (Optional)'}</Text>
                <TextInput
                    style={styles.textInput}
                    value={place}
                    onChangeText={setPlace}
                    placeholder={isIncome ? "e.g. Annual Bonus" : "e.g. Starbucks"}
                    placeholderTextColor={theme.colors.textSecondary}
                />

                <View style={{ height: 40 }} />
                <Button
                    title={isIncome ? "Save Income" : "Save Expense"}
                    onPress={handleSave}
                    loading={loading}
                    variant={isIncome ? 'secondary' : 'primary'} // Green for income, Purple for expense
                />
            </ScrollView>
        </KeyboardAvoidingView>
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
        padding: theme.spacing.m,
        paddingTop: theme.spacing.xl,
    },
    backButton: {
        marginRight: theme.spacing.m,
        padding: theme.spacing.s,
    },
    content: {
        padding: theme.spacing.m,
    },
    label: {
        ...theme.typography.label,
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.s,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primary,
        marginBottom: theme.spacing.m,
    },
    currencySymbol: {
        fontSize: 40,
        color: theme.colors.primary,
        fontWeight: '700',
        marginRight: theme.spacing.s,
    },
    amountInput: {
        flex: 1,
        fontSize: 40,
        color: theme.colors.text,
        fontWeight: '700',
        paddingVertical: theme.spacing.s,
    },
    textInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        color: theme.colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    pill: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    pillActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    pillText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    pillTextActive: {
        color: '#FFFFFF',
    }
});
