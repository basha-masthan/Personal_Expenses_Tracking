import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../utils/theme';
import { Button } from '../components/Button';
import { saveExpense } from '../utils/storage';
import { ArrowLeft } from 'lucide-react-native';

const PURPOSES = ['Food', 'Travelling', 'Tea/Coffee', 'Movie', 'Entertainment', 'Shopping', 'Others'];
const WITH_WHOM = ['Self', 'Family', 'Relatives', 'Friends', 'Unknown'];

export default function AddExpenseScreen({ navigation }) {
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState(PURPOSES[0]);
    const [withWhom, setWithWhom] = useState(WITH_WHOM[0]);
    const [place, setPlace] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        setLoading(true);
        const newExpense = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            purpose,
            withWhom,
            place,
            date: new Date().toISOString(),
        };

        try {
            await saveExpense(newExpense);
            setLoading(false);
            navigation.goBack();
        } catch (e) {
            setLoading(false);
            Alert.alert('Error', 'Failed to save expense');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={theme.typography.header}>Add Expense</Text>
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

                <Text style={styles.label}>Purpose</Text>
                <View style={styles.pills}>
                    {PURPOSES.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.pill, purpose === p && styles.pillActive]}
                            onPress={() => setPurpose(p)}
                        >
                            <Text style={[styles.pillText, purpose === p && styles.pillTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

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

                <Text style={styles.label}>Place/Shop (Optional)</Text>
                <TextInput
                    style={styles.textInput}
                    value={place}
                    onChangeText={setPlace}
                    placeholder="e.g. Starbucks"
                    placeholderTextColor={theme.colors.textSecondary}
                />

                <View style={{ height: 40 }} />
                <Button title="Save Expense" onPress={handleSave} loading={loading} />
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
