# Sutaung.bar | Make a Wish 🌕

**Sutaung.bar** (ဆုတောင်းပါ) is a digital interactive experience inspired by the Lighting Festivals of Myanmar (Thadingyut and Tazaungdaing). It allows users to write a wish and release it as a floating lantern into a virtual starry night sky.

**Live Demo:** [https://sutaung.bar](https://sutaung.bar)


## ✨ Features

### 🏮 Visual Atmosphere
*   **Virtual Night Sky:** A responsive background with 150+ twinkling stars.
*   **Moon Phases:** Real-time moon phase calculation (New Moon, Waxing, Full Moon, Waning) that syncs with the actual astronomical calendar.
*   **Real-time Lanterns:** Wishes appear instantly as floating lanterns using Firebase Firestore.
*   **Golden Lanterns:** If a wish becomes popular (10+ "Sadus"), the lantern turns **Gold** and glows brighter than the rest.

### 🎨 Personalization
Users can customize their lantern color, each representing a specific intent:
*   🟠 **Orange:** General Wish
*   🔴 **Red:** Love & Courage
*   🟢 **Green:** Health & Harmony
*   🔵 **Blue:** Peace & Calm
*   🟣 **Purple:** Wisdom & Wealth

### 🤝 Interaction & Engagement
*   **"Sadu" (🙏) System:** A cultural equivalent of a "Like." Users can bless others' wishes. Includes local storage checks to prevent duplicate clicks.
*   **"Find My Lantern":** A tracker button that highlights the user's specific lantern in the crowded sky using a pulsing beacon effect.
*   **Lantern Looping:** To keep the sky alive without over-reading the database, lanterns "recycle" and loop back into the queue after floating off-screen.

### 🛡️ Safety & Moderation
*   **Profanity Filter:** Automatically blocks wishes containing offensive words (Burmese & English).
*   **Spam Protection:** Blocks keyboard smashing (e.g., "aaaaa") and prevents ultra-long inputs without spaces.
*   **Community Reporting:** Users can flag offensive content. If a wish receives **5 Reports**, it is automatically hidden from the public view.
*   **Rate Limiting:** Users are limited to releasing **1 wish per minute** to prevent spam (tracked via LocalStorage).

## 🛠️ Technical Architecture
*   **Frontend:** Vanilla JavaScript (ES6 Modules), CSS3 (Glassmorphism, Animations).
*   **Backend:** Firebase Firestore (Realtime Database).
*   **Performance:**
    *   **Queue System:** Controls traffic to ensure only 15 lanterns are rendered at a time, preventing browser crashes on low-end devices.
    *   **Optimistic UI:** "Sadu" counts update instantly for the user while the database updates in the background.


## 🚀 Local Development

To run this project locally on your machine:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ninjastrikers/sutaung-bar.git
    cd sutaung-bar
    ```

2.  **Firebase Configuration**
    *   Create a project at [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Firestore Database** and **Hosting**.
    *   Copy your web app configuration keys.
    *   Open `script.js` and replace the `firebaseConfig` object with your own keys.

3.  **Run Locally**
    *   Use a local server (e.g., VS Code "Live Server" extension) to run `index.html`.

## 📦 Deployment

This project is configured for Firebase Hosting with HSTS headers enabled for `.bar` domain security compliance.

1.  Install Firebase CLI:
    ```bash
    npm install -g firebase-tools
    ```
2.  Login and Deploy:
    ```bash
    firebase login
    firebase init hosting
    firebase deploy
    ```
## 🔐 Security Note
* You will notice the Firebase API keys are visible in `script.js`. **This is intentional and safe**.
Firebase Client SDK keys are designed to be public identifiers.
* Security is handled via **Firestore Security Rules** (server-side) and **Google Cloud Console Referrer Restrictions**.


## 🌏 Cultural Context

*   **"Sutaung" (ဆုတောင်း):** Means "Make a wish" or "Pray" in Burmese.
*   **"Sadu" (သာဓု):** A Pali word used in Myanmar culture to acknowledge and rejoice in someone else's good deed or merit. It is used here equivalent to a "Like" or "Amen."
*   **Lanterns:** Releasing fire balloons or lanterns is a tradition during the Tazaungdaing festival to pay homage to the Sulamani Pagoda in heaven and to float away bad luck.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Built with ❤️ by Team NinjaStrikers