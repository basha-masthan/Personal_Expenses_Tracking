# Deploying Your Landing Page to Vercel

Vercel is a perfect choice for hosting your landing page. It's fast, free, and very reliable.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you haven't already.
2.  **APK File**: You must have your built `MoneyControle.apk` file ready.

## Step 1: Prepare the Folder

Ensure your `landing-page` folder has both files:
*   `index.html` (I created this for you)
*   `MoneyControle.apk` (You need to download this from your build)

## Step 2: Deploy using Command Line (Easiest & Fastest)

You don't need to push to GitHub to deploy this. You can upload it directly from your terminal.

1.  **Open Terminal** in your project folder (`Money_Controle`).
2.  **Run the deploy command**:
    ```bash
    npx vercel landing-page
    ```
    *(Note: We point it specifically to the `landing-page` folder so it only deploys the website, not your entire React Native code).*

3.  **Follow the Prompts**:
    *   **Set up and deploy?** [y/N] -> Type **y**
    *   **Which scope?** -> Select your account (Press Enter)
    *   **Link to existing project?** -> Type **n**
    *   **Project Name?** -> Press Enter (default `landing-page`) or type `money-controle-app`
    *   **In which directory is your code located?** -> Press Enter (it should detect the current folder).

4.  **Wait for Upload**:
    Vercel will upload your HTML and APK file.

## Step 3: Get Your URL

Once finished, the terminal will show:
`Production: https://money-controle-app.vercel.app [copied to clipboard]`

**That is your live website link!**
Send this link to your users. They can open it and click "Download for Android".

---

### Important Note on Git
If you prefer to deploy via GitHub (Git Integration):
1.  The `MoneyControle.apk` file might be large. GitHub blocks files larger than 100MB. Your APK should be smaller (usually ~30-50MB), so it should be fine.
2.  You would need to push the `landing-page` folder to a repository and import it in the Vercel Dashboard.
3.  **The CLI method (Step 2 above) avoids all Git complexity.**
