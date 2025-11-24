# Sutaung.bar | Make a Wish 🌕

**Sutaung.bar** (ဆုတောင်းပါ) is a digital interactive experience inspired by the Lighting Festivals of Myanmar (Thadingyut and Tazaungdaing). It allows users to write a wish and release it as a floating lantern into a virtual starry night sky.

**Live Demo:** [https://sutaung.bar](https://sutaung.bar)


## ✨ Features

### 🏮 Core Experience
*   **Virtual Night Sky:** A responsive, animated background with twinkling stars and a glowing moon.
*   **Real-time Lanterns:** Wishes appear instantly as floating lanterns using Firebase Firestore.
*   **Wish Interaction:** Click on any lantern to read the wish inside.

### 🎨 Personalization & Tracking
*   **Color Customization:** Users can choose from 5 lantern colors, each representing a different meaning (e.g., Orange for General, Red for Love, Green for Health).
*   **"Find My Lantern":** A tracker button helps users locate their specific lantern in the crowded sky.
*   **"Sadu" System:** A cultural "Like" button. If a wish receives 10+ "Sadu" (Well done/Amen), the lantern turns **Golden** and glows brighter.

### 🛡️ Safety & Moderation
*   **Profanity Filter:** preventing offensive language from being posted.
*   **Community Reporting:** Users can flag offensive wishes. Wishes with 5+ reports are automatically hidden.
*   **Rate Limiting:** Prevents spam by limiting users to one wish per minute.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (Animations, Glassmorphism), JavaScript (ES6 Modules).
*   **Backend:** Firebase Firestore (Realtime Database).
*   **Hosting:** Firebase Hosting.
*   **Design:** Custom CSS gradients and animations (No external CSS frameworks used).

## 🌏 Cultural Context

*   **"Sutaung" (ဆုတောင်း):** Means "Make a wish" or "Pray" in Burmese.
*   **"Sadu" (သာဓု):** A Pali word used in Myanmar culture to acknowledge and rejoice in someone else's good deed or merit. It is used here equivalent to a "Like" or "Amen."
*   **Lanterns:** Releasing fire balloons or lanterns is a tradition during the Tazaungdaing festival to pay homage to the Sulamani Pagoda in heaven and to float away bad luck.

## 🚀 Local Development

To run this project locally on your machine:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/sutaung-bar.git
    cd sutaung-bar
    ```

2.  **Firebase Configuration**
    *   Create a project at [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Firestore Database** and **Hosting**.
    *   Copy your web app configuration keys.
    *   Open `script.js` and replace the `firebaseConfig` object with your own keys.

3.  **Run Locally**
    Since this project uses ES6 Modules, you need a local server.
    *   If using VS Code, install the **Live Server** extension.
    *   Right-click `index.html` and select **"Open with Live Server"**.

## 📦 Deployment

This project is configured for Firebase Hosting.

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

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Built with ❤️ by Team NinjaStrikers