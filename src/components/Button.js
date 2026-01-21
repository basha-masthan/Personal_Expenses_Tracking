import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '../utils/theme';

export const Button = ({ title, onPress, variant = 'primary', loading = false, style, textStyle, icon }) => {
    const isPrimary = variant === 'primary';
    const bgColor = isPrimary ? theme.colors.primary : 'transparent';
    const textColor = isPrimary ? '#FFFFFF' : theme.colors.primary;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: bgColor,
                    borderColor: theme.colors.primary,
                    borderWidth: isPrimary ? 0 : 2
                },
                style
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
                    <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    }
});
