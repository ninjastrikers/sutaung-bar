// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, increment, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyBy1Ncr0FQrEIKACPLQ774PzahFwDXGiJs",
  authDomain: "sutaungbar.firebaseapp.com",
  projectId: "sutaungbar",
  storageBucket: "sutaungbar.firebasestorage.app",
  messagingSenderId: "791510292608",
  appId: "1:791510292608:web:0dd38439271e994b3eee65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const sky = document.getElementById('sky');
const wishInput = document.getElementById('wishInput');
const releaseBtn = document.getElementById('releaseBtn');
const modal = document.getElementById('wishModal');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');
const saduBtn = document.getElementById('saduBtn');
const saduCountDisplay = document.getElementById('saduCount');
const reportBtn = document.getElementById('reportBtn');

// Global State
let wishQueue = [];          
let currentOpenDocId = null; // Tracks which wish is currently open
const MAX_LANTERNS = 15;     
const RELEASE_SPEED = 800;   
const REPORT_THRESHOLD = 5; 

// 1. Generate Stars
function generateStars() {
    const starCount = 150; 
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 5 + 2; 
        const delay = Math.random() * 5; 

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animation = `twinkle ${duration}s infinite ${delay}s ease-in-out`;

        sky.appendChild(star);
    }
}

// 2. Create Visual Lantern
function createLantern(wishData, id) {
    if (!id) return; // Safety check: No ID, no lantern

    // Filter reported wishes
    if ((wishData.reportCount || 0) >= REPORT_THRESHOLD) return;

    const existingLantern = document.getElementById(`lantern-${id}`);
    const isPopular = (wishData.saduCount || 0) >= 10;

    if (existingLantern) {
        if (isPopular) existingLantern.classList.add('golden');
        return; 
    }

    const lantern = document.createElement('div');
    lantern.classList.add('lantern');
    lantern.id = `lantern-${id}`; 
    
    if (isPopular) lantern.classList.add('golden');

    lantern.style.left = Math.random() * 90 + '%';
    lantern.style.bottom = '-50px';

    const duration = Math.random() * 15 + 25; 
    lantern.style.transition = `bottom ${duration}s linear`;

    // CLICK EVENT: Set the ID so buttons work
    lantern.addEventListener('click', () => {
        currentOpenDocId = id; // <--- CRITICAL: Store the ID
        modalText.innerText = wishData.text;
        saduCountDisplay.innerText = wishData.saduCount || 0;
        modal.classList.remove('hidden');
    });

    sky.appendChild(lantern);

    setTimeout(() => { lantern.style.bottom = '120%'; }, 100);
    setTimeout(() => { lantern.remove(); }, duration * 1000);
}

// 3. Queue Processor
setInterval(() => {
    const currentLanterns = document.querySelectorAll('.lantern').length;
    if (currentLanterns < MAX_LANTERNS && wishQueue.length > 0) {
        const item = wishQueue.shift();
        if(item.id) { // Only create if ID exists
            createLantern(item.data, item.id);
        }
    }
}, RELEASE_SPEED);

// 4. Release a Wish
const badWords = ["fuck", "dick", "sapat", "lee", "လီး", "စပတ်", "စောက်ဖုတ်", "လိုး", "စောက်ပတ်"];

releaseBtn.addEventListener('click', async () => {
    // Rate Limit
    const lastWishTime = localStorage.getItem('lastWishTime');
    const now = Date.now();
    if (lastWishTime && now - parseInt(lastWishTime) < 60000) {
        const remaining = Math.ceil((60000 - (now - lastWishTime)) / 1000);
        alert(`Please wait ${remaining} seconds before making another wish.`);
        return;
    }

    const text = wishInput.value.trim();
    if (text === "") return alert("Please make a wish first!");

    const hasBadWord = badWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
    if (hasBadWord) {
        alert("Please keep your wish positive and clean."); 
        return; 
    }

    try {
        // Add to DB and GET REFERENCE immediately
        const docRef = await addDoc(collection(db, "wishes"), {
            text: text,
            saduCount: 0,
            reportCount: 0,
            timestamp: Date.now()
        });
        
        localStorage.setItem('lastWishTime', Date.now());

        // Create lantern IMMEDIATELY with the correct ID
        createLantern({ text: text, saduCount: 0 }, docRef.id);

        wishInput.value = ""; 
        alert("Your wish has been released to the sky!");
    } catch (e) {
        console.error("Error: ", e);
        alert("Could not save wish. Check console for error.");
    }
});

// 5. Buttons Logic

// Sadu (Like)
saduBtn.addEventListener('click', async () => {
    if (!currentOpenDocId) {
        console.error("No ID found for this lantern.");
        return;
    }
    
    // Optimistic UI: Update number instantly
    let currentCount = parseInt(saduCountDisplay.innerText);
    saduCountDisplay.innerText = currentCount + 1;
    saduBtn.style.transform = "scale(1.2)";
    setTimeout(() => saduBtn.style.transform = "scale(1)", 200);

    try {
        const wishRef = doc(db, "wishes", currentOpenDocId);
        await updateDoc(wishRef, { saduCount: increment(1) });
        console.log("Sadu updated in DB");
    } catch (e) { 
        console.error("Sadu Failed:", e);
        // Revert number if failed
        saduCountDisplay.innerText = currentCount; 
        alert("Failed to update Sadu. Permissions or Network error.");
    }
});

// Report
reportBtn.addEventListener('click', async () => {
    if (!currentOpenDocId) return;
    
    const reportedItems = JSON.parse(localStorage.getItem('reportedWishes') || "[]");
    if (reportedItems.includes(currentOpenDocId)) {
        alert("You have already reported this wish.");
        return;
    }

    const confirmReport = confirm("Are you sure you want to report this wish?");
    if (!confirmReport) return;

    try {
        const wishRef = doc(db, "wishes", currentOpenDocId);
        await updateDoc(wishRef, { reportCount: increment(1) });

        reportedItems.push(currentOpenDocId);
        localStorage.setItem('reportedWishes', JSON.stringify(reportedItems));

        alert("Thank you. We will review this.");
        modal.classList.add('hidden'); 
        currentOpenDocId = null;
    } catch (e) { 
        console.error(e);
        alert("Report failed. Please try again.");
    }
});

// 6. Realtime Listener
const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"), limit(50));

onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const id = change.doc.id;
        
        // Remove if too many reports
        if ((data.reportCount || 0) >= REPORT_THRESHOLD) {
            const el = document.getElementById(`lantern-${id}`);
            if (el) el.remove();
            return;
        }

        if (change.type === "added") {
            // Only add to queue, don't auto-create if we just made it via button
            // (The button creation handles the user's immediate lantern)
            wishQueue.push({ data, id });
        } 
        else if (change.type === "modified") {
            const lanternEl = document.getElementById(`lantern-${id}`);
            if (lanternEl && (data.saduCount || 0) >= 10) {
                lanternEl.classList.add('golden');
            }
            // Update modal if open
            if (currentOpenDocId === id) {
                saduCountDisplay.innerText = data.saduCount || 0;
            }
        }
    });
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    currentOpenDocId = null;
});

// Init
generateStars();