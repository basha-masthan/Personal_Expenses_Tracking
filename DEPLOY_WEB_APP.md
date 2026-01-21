# Deploying the React Native App as a Website (PWA)

You can run your actual application as a website (Progressive Web App) on Vercel.
I have already installed the necessary dependencies (`react-native-web`, `react-dom`) and configured your Excel export to work on the browser.

## Step 1: Export the Website

Run the following command in your terminal to create a static version of your app:

```bash
npx expo export --platform web
```

*   This will create a `dist` folder in your project directory containing your web app.

## Step 2: Deploy to Vercel

1.  **Run the deploy command**:
    ```bash
    cd dist
    npx vercel
    ```
    *(Note: We navigate into the folder to avoid path errors).*

2.  **Follow the Prompts**:
    *   **Set up and deploy?** [y/N] -> **y**
    *   **Which scope?** -> Select your account.
    *   **Link to existing project?** -> **n**
    *   **Project Name?** -> e.g., `money-controle-web`
    *   **In which directory?** -> Press **Enter** (it stays as `dist`).

## Step 3: Done!

Vercel will give you a link (e.g., `https://money-controle-web.vercel.app`).
You can open this link on your phone or computer, and the app will run exactly like it does on mobile!

### Important Differences on Web:
1.  **Data Storage**: Your expenses are stored in the **browser's cache**. If you clear your browser history/cache, the data might be lost. (On mobile, it stays in the app storage).
2.  **Installation**: Users can "Install" the app by clicking "Add to Home Screen" in their browser menu. It will behave like a mobile app.
