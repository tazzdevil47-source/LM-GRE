# LM GRE App · GRE Vocabulary PWA

Mobile- and desktop-friendly progressive web app using only the **1,000 GRE headwords** from the uploaded Magoosh GRE vocabulary PDF. No account, payments, API keys, build tools, or server needed for studying.

## Launch it on GitHub Pages

1. Create a **public GitHub repository**, e.g. `lm-gre-app`.
2. Upload the **contents of this folder** to the repository root. Ensure `index.html`, `app.js`, `words.js`, `style.css`, `sw.js`, `manifest.webmanifest`, and `icons/` are all committed.
3. In repository **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, `main`, `/ (root)`, then Save.
4. Open the GitHub Pages URL shown in Settings → Pages. Use password `lm` to unlock.
5. In Chrome/Edge/Android, choose **Install app** / **Add to Home screen**. You can study offline after opening it once online.

You can also drag-and-drop this folder onto another static HTTPS host. For local testing, use `python -m http.server 8000` in the folder and open `http://localhost:8000` (service workers work on localhost). Opening `index.html` as a raw `file://` document may work without installation, but PWA install/offline caching needs HTTPS or localhost.

## Three study paths

- **Flashcard academy:** select ten consecutive pages of the original 95-page PDF, a category, a difficulty tier, bookmarks, or due-review words; flip the cards and rate `Again / Hard / Good / Easy` with a due-date review schedule. Each word shows its original PDF example and a distinct practice sentence.
- **Exam arena:** multiple-choice questions for selected words including definition recognition and contextual recognition. Pick 10, 20, 30, 50, or all available questions. See missed answers and explanations.
- **Two-minute sprint:** 120-second multiple-choice rapid-fire drills. Every response reveals the correct definition and both example sentences; advance when ready while the timer runs.

The **word vault** supports lookup and bookmarks, and **progress** shows levels, category coverage, and recent sessions.

## Source data and levels

The three original PDF categories are 350 Basic, 300 Common (High-frequency), and 350 Advanced. The five **app-estimated difficulty levels** are **not official Magoosh classifications**. The page grouping preserves the PDF's 95-page pagination (ten-page groups, last group pages 91–95). Definitions, parts of speech, and original example sentences come from the uploaded source. The second practice sentence is an app-authored learning aid and is not claimed as PDF text. Some generated practice sentences are generic; original definitions take precedence in case of any ambiguity.

## Backups and privacy

All progress is saved in your browser's localStorage, with explicit saves for bookmarks, notes, and answers. Use **Settings → Export backup** regularly; imports restore existing records. Browser clearing/data removal will erase local progress unless a backup was exported. There is no cloud sync.

The password `lm` is a convenience screen lock **visible in frontend code, not true authentication or encryption**. Do not store secrets in the app.

## Files

- `index.html` — app shell, login and navigation
- `style.css` — styles, responsive layouts
- `words.js` — full 1,000-word source dictionary + second practice examples
- `app.js` — app, flashcards, quizzes, reviews, settings
- `manifest.webmanifest`, `sw.js`, `icons/` — installable offline PWA components
- `data-audit.json` — vocabulary extraction report

## Renamed from the original app

The on-device storage key remains unchanged for compatibility when updating an existing deployment at the same URL. Exports use the new LM GRE App name; imports accept both the old and new backup formats. Installing the renamed app may require refreshing the existing site or removing and reinstalling an older home-screen shortcut.
