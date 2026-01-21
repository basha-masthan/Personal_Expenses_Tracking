import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { Platform } from 'react-native';

const STORAGE_KEY = 'expenses_data';

/**
 * Save a new transaction (expense or income) to AsyncStorage.
 * @param {Object} transaction - The transaction object to save.
 * @returns {Promise<Array>} - The updated list of transactions.
 */
export const saveTransaction = async (transaction) => {
    try {
        const storedData = await getTransactions();
        const newData = [transaction, ...storedData];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return newData;
    } catch (e) {
        console.error("Error saving transaction", e);
        throw e;
    }
};

/**
 * Retrieve all transactions from AsyncStorage.
 * Handles backward compatibility by defaulting missing 'type' to 'expense'.
 * @returns {Promise<Array>} - The list of transactions.
 */
export const getTransactions = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
            const data = JSON.parse(jsonValue);
            // Migration/Compatibility: Add type='expense' if missing
            return data.map(item => ({
                ...item,
                type: item.type || 'expense'
            }));
        }
        return [];
    } catch (e) {
        console.error("Error reading transactions", e);
        return [];
    }
};

export const clearTransactions = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error("Error clearing transactions", e);
    }
};

/**
 * Delete a specific transaction by ID.
 * @param {string} id - The ID of the transaction to delete.
 * @returns {Promise<Array>} - The updated list of transactions.
 */
export const deleteTransaction = async (id) => {
    try {
        const storedData = await getTransactions();
        const newData = storedData.filter(e => e.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return newData;
    } catch (e) {
        console.error("Error deleting transaction", e);
        throw e;
    }
};

/**
 * Export expenses to an Excel file and share it.
 */
export const exportToExcel = async () => {
    try {
        const allData = await getTransactions();
        // Filter only expenses as requested
        const data = allData.filter(t => t.type === 'expense');

        if (data.length === 0) {
            return false;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expenses");

        if (Platform.OS === 'web') {
            // On web, this triggers a file download
            XLSX.writeFile(wb, 'expenses.xlsx');
            return true;
        }

        const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });
        const uri = FileSystem.cacheDirectory + 'expenses.xlsx';

        await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: 'base64'
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
            return true;
        } else {
            console.warn("Sharing is not available on this platform");
            return false;
        }
    } catch (e) {
        console.error("Error exporting to excel", e);
        throw e;
    }
};
