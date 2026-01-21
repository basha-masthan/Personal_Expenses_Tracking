import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export const Card = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        ...theme.shadows.subtle,
        borderWidth: 1,
        borderColor: theme.colors.border,
    }
});
