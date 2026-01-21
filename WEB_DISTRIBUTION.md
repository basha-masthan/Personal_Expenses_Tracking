# Distributing via Web Landing Page

Since you want to avoid the Google Play Store fee, you can host your own landing page where users can download the app directly.

## Step 1: Build the APK (Android Package)

Instead of building for the Play Store (AAB), we will build a standard Android executable (APK) that users can install directly.

1.  **Run the Build Command**:
    The project is already configured with a `preview-apk` profile. Run:
    ```bash
    eas build -p android --profile preview-apk
    ```
2.  **Wait for Build**:
    Expo will build your app in the cloud. This might take 10-15 minutes.
3.  **Download the APK**:
    When finished, the terminal will show a link (and you'll get an email). Download the `.apk` file to your computer.
4.  **Rename**:
    Rename the downloaded file to **`MoneyControle.apk`**.

## Step 2: Prepare the Landing Page

I have already created a beautiful landing page for you in the `landing-page/` folder.

1.  **Move the APK**:
    Copy your renamed `MoneyControle.apk` file into the `landing-page/` folder.
    
    Your folder structure should look like this:
    ```
    landing-page/
    ├── index.html
    └── MoneyControle.apk
    ```

## Step 3: Publish the Website

You need a place to host these files. The easiest free options are **Netlify** or **GitHub Pages**.

### **Option A: Netlify Drop (Easiest)**
1.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Drag and drop the entire `landing-page` folder onto the browser window.
3.  Netlify will instantly publish it and give you a URL (e.g., `https://random-name-123.netlify.app`).
4.  You can change the site name in "Site Settings" to something like `money-controle.netlify.app`.

### **Option B: GitHub Pages**
1.  Create a new repository on GitHub (e.g., `money-controle-web`).
2.  Upload `index.html` and `MoneyControle.apk` to it.
3.  Go to Repository Settings -> Pages.
4.  Select the `main` branch and save.
5.  Your site will be live at `https://yourusername.github.io/money-controle-web`.

## Step 4: Share!

Send the link to your friends or users.
*   When they open the link on Android, they can tap **"Download for Android"**.
*   They will need to allow "Install from Unknown Sources" (the phone will prompt them) since it's not from the Play Store.
