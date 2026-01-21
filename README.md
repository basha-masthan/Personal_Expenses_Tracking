# Money Controle

A personal expense tracking application built with React Native and Expo.

## Features

- **Add Expenses**: Track your spending with details like Amount, Purpose, With Whom, and Place.
- **Dashboard**: View your spending summary filtered by Day, Week, Month, or Year.
- **Analytics**: See your highest spent amount and most frequent spending purpose.
- **Local Storage**: All data is stored locally on your device using AsyncStorage.
- **Excel Export**: Export your expense history to an Excel (.xlsx) file for external analysis.

## Project Structure

- `src/components`: Reusable UI components (Card, Button).
- `src/screens`: Application screens (Dashboard, AddExpense).
- `src/navigation`: Navigation configuration.
- `src/utils`: Utility functions (Storage, Theme).

## Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with the **Expo Go** app on your Android or iOS device.

## Dependencies

- `expo`
- `react-navigation`
- `async-storage`
- `xlsx` (for Excel export)
- `date-fns` (for date formatting and filtering)
- `lucide-react-native` (for icons)
"# Personal_Expenses_Tracking" 
