import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LayoutDashboard, Wallet, CreditCard } from 'lucide-react-native';

import OverviewScreen from '../screens/OverviewScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Overview"
                component={OverviewScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Income"
                component={IncomeScreen}
                options={{
                    tabBarLabel: 'Income',
                    tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
                    tabBarActiveTintColor: theme.colors.secondary, // Green for income
                }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{
                    tabBarLabel: 'Expenses',
                    tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <SafeAreaProvider>
            <NavigationContainer theme={{
                ...DarkTheme,
                colors: {
                    ...DarkTheme.colors,
                    primary: theme.colors.primary,
                    background: theme.colors.background,
                    card: theme.colors.surface,
                    text: theme.colors.text,
                    border: theme.colors.border,
                    notification: theme.colors.accent,
                }
            }}>
                <StatusBar style="light" />
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right'
                    }}
                >
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
                    <Stack.Screen name="History" component={HistoryScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
