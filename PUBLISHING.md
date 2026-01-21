# publishing to Google Play Store

This guide will walk you through the steps to build your Expo app and publish it to the Google Play Store.

## Prerequisites

1.  **Google Play Developer Account**: You need to sign up at the [Google Play Console](https://play.google.com/console). (There is a one-time registration fee).
2.  **EAS Account**: Create a free account at [expo.dev](https://expo.dev).
3.  **EAS CLI**: Install the EAS CLI globally on your machine:
    ```bash
    npm install -g eas-cli
    ```

## Step 1: Configuration

Your `app.json` has already been configured with a default package name: `com.moneycontrole.app`.

*   **Important**: If you have your own domain or want a custom ID, change the `"package"` field in `app.json` to something unique (e.g., `com.yourname.moneycontrole`).

## Step 2: Build the Android App Bundle (.aab)

Google Play requires an Android App Bundle (.aab) file for distribution.

1.  **Login to EAS**:
    Run the following command in your terminal and log in with your Expo credentials:
    ```bash
    eas login
    ```

2.  **Configure the Build**:
    Run this command to create an `eas.json` configuration file:
    ```bash
    eas build:configure
    ```
    Select **Android** when prompted.

3.  **Run the Build**:
    Run the following command to start the cloud build:
    ```bash
    eas build --platform android
    ```
    *   This will upload your code to Expo's build servers.
    *   Wait for the build to complete.
    *   Once finished, it will provide a link to download your `.aab` file.

## Step 3: Upload to Google Play Console

1.  **Create App**: Log in to the Google Play Console and click **Create App**.
2.  **Fill Details**: Enter your App Name (Money Controle), default language, and select "App" and "Free".
3.  **Dashboard**: You will be taken to the dashboard. Follow the "Set up your app" tasks:
    *   **Privacy Policy**: You need a privacy policy URL (you can generate a free one online).
    *   **App Access**: E.g., "All functionality is available without special access".
    *   **Content Rating**: Fill out the questionnaire.
    *   **Target Audience**: Select age group (e.g., 18+).
    *   **News Apps**: Select "No".
4.  **Create Release**:
    *   Go to **Testing > Internal testing** (recommended for first look) or **Production**.
    *   Click **Create hew release**.
    *   **Upload the .aab file** you downloaded from Step 2.
    *   Enter a release name (e.g., "1.0.0 Initial Release") and release notes.
5.  **Review and Rollout**:
    *   Click "Next" to review any warnings.
    *   Click "Save" and then "Start rollout".

## Updating Your App

When you want to release a new version:
1.  Increment the `"versionCode"` (e.g., to 2) and `"version"` (e.g., "1.0.1") in `app.json`.
2.  Run `eas build --platform android` again.
3.  Upload the new `.aab` to the Play Console.
