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
const findMyLanternBtn = document.getElementById('findMyLanternBtn');
const colorMeaningLabel = document.getElementById('colorMeaning');

// Global State
let wishQueue = [];          // Waiting line for lanterns
let currentOpenDocId = null; // Currently opened wish ID
let selectedColor = "orange"; // Default color
const MAX_LANTERNS = 15;     // Max visual lanterns on screen
const RELEASE_SPEED = 1200;  // Gap between lanterns (ms)
const REPORT_THRESHOLD = 5;  // Auto-hide if reported 5 times

// 0. Color Selection Logic
const colorMeanings = {
    orange: { text: "General Wish", hex: "#ff8c00" },
    red: { text: "Love & Courage", hex: "#ff4444" },
    green: { text: "Health & Harmony", hex: "#44ff44" },
    blue: { text: "Peace & Calm", hex: "#4488ff" },
    purple: { text: "Wisdom & Wealth", hex: "#aa44ff" }
};

document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
        // UI Update
        document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
        e.target.classList.add('selected');
        
        // Logic Update
        selectedColor = e.target.getAttribute('data-color');
        
        // Label Update
        const info = colorMeanings[selectedColor];
        colorMeaningLabel.innerText = info.text;
        colorMeaningLabel.style.color = info.hex;
    });
});

// --- MOON PHASE LOGIC (Accurate) ---
function updateMoonPhase() {
    const moonEl = document.querySelector('.moon');
    const date = new Date();

    // 1. Calculate Moon Age
    // Ref: New Moon Jan 6 2000
    const knownNewMoon = new Date('2000-01-06 12:24:01'); 
    const cycleLength = 29.53058867; 
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const moonAge = diffDays % cycleLength;

    // 2. Clear old classes
    moonEl.className = 'moon'; // Reset to base class

    let phaseName = "";

    // 3. Determine Phase (8 Stages)
    if (moonAge < 1.84) {
        moonEl.classList.add('new');
        phaseName = "New Moon";
    } 
    else if (moonAge < 5.53) {
        moonEl.classList.add('waxing-crescent');
        phaseName = "Waxing Crescent";
    } 
    else if (moonAge < 9.22) {
        // Includes First Quarter (Half)
        moonEl.classList.add('first-quarter');
        phaseName = "First Quarter";
    } 
    else if (moonAge < 12.91) {
        moonEl.classList.add('waxing-gibbous');
        phaseName = "Waxing Gibbous";
    } 
    else if (moonAge < 16.61) {
        moonEl.classList.add('full');
        phaseName = "Full Moon";
    } 
    else if (moonAge < 20.30) {
        moonEl.classList.add('waning-gibbous');
        phaseName = "Waning Gibbous";
    } 
    else if (moonAge < 23.99) {
        moonEl.classList.add('last-quarter');
        phaseName = "Last Quarter";
    } 
    else if (moonAge < 27.68) {
        moonEl.classList.add('waning-crescent');
        phaseName = "Waning Crescent";
    } 
    else {
        moonEl.classList.add('new');
        phaseName = "New Moon";
    }

    // 4. Tooltip
    moonEl.setAttribute('title', `Tonight: ${phaseName} (Age: ${moonAge.toFixed(1)})`);
    console.log(`Moon Phase: ${phaseName} (Age: ${moonAge.toFixed(1)})`);
}

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

// --- 2. LANTERN CREATION (The Core Visual) ---
function createLantern(wishData, id) {
    if (!id) return; 

    // Safety: Don't show reported content
    if ((wishData.reportCount || 0) >= REPORT_THRESHOLD) return;

    // Avoid duplicates on screen
    const existingLantern = document.getElementById(`lantern-${id}`);
    const isPopular = (wishData.saduCount || 0) >= 10;

    if (existingLantern) {
        if (isPopular) existingLantern.classList.add('golden');
        return; 
    }

    // Build DOM Element
    const lantern = document.createElement('div');
    lantern.classList.add('lantern');
    lantern.id = `lantern-${id}`;
    
    // Add Color Class
    if (wishData.color && wishData.color !== 'orange') {
        lantern.classList.add(wishData.color);
    }

    // "My Lantern" Highlight
    const myLanternId = localStorage.getItem('myLanternId');
    if (id === myLanternId) {
        lantern.classList.add('my-lantern');
        findMyLanternBtn.classList.remove('hidden'); 
    }
    
    // Golden Status
    if (isPopular) lantern.classList.add('golden');

    // Random Start Position
    lantern.style.left = Math.random() * 90 + '%';
    lantern.style.bottom = '-50px';

    // Random Speed (Floating Up)
    const duration = Math.random() * 15 + 25; 
    lantern.style.transition = `bottom ${duration}s linear`;

    // Click Event -> Open Modal
    lantern.addEventListener('click', () => {
        currentOpenDocId = id; 
        modalText.innerText = wishData.text;
        saduCountDisplay.innerText = wishData.saduCount || 0;
        modal.classList.remove('hidden');
    });

    sky.appendChild(lantern);

    // Trigger Animation (Next Frame)
    setTimeout(() => { lantern.style.bottom = '120%'; }, 100);

    // --- CLEANUP & RECYCLING (LOOPING) ---
    setTimeout(() => {
        lantern.remove();

        // RECYCLING LOGIC:
        // If the sky isn't too crowded, put this wish back 
        // at the end of the line to show it again later.
        if (wishQueue.length < 50) {
            wishQueue.push({ data: wishData, id: id });
        }

    }, duration * 1000);
}

// --- 3. QUEUE PROCESSOR (Traffic Controller) ---
setInterval(() => {
    const currentLanterns = document.querySelectorAll('.lantern').length;
    // Only release if under limit AND queue has items
    if (currentLanterns < MAX_LANTERNS && wishQueue.length > 0) {
        const item = wishQueue.shift();
        if(item.id) createLantern(item.data, item.id);
    }
}, RELEASE_SPEED);

// --- 4. RELEASE WISH (User Action) ---
const badWords = ["fuck", "dick", "sapat", "lee", "လီး", "စပတ်", "စောက်ဖုတ်", "လိုး", "စောက်ပတ်", "မအေလိုး", "ငါလိုးမ", "ဖေလိုးမ", "လီးပဲ"];

releaseBtn.addEventListener('click', async () => {
    // A. Rate Limit Check
    const lastWishTime = localStorage.getItem('lastWishTime');
    const now = Date.now();
    if (lastWishTime && now - parseInt(lastWishTime) < 60000) {
        const remaining = Math.ceil((60000 - (now - lastWishTime)) / 1000);
        alert(`Please wait ${remaining} seconds before making another wish.`);
        return;
    }

    // B. Basic Content Checks
    const text = wishInput.value.trim();
    
    // 1. Min Length Check
    if (text.length < 3) {
        return alert("Your wish is too short. Please write a bit more!");
    }

    // 2. Max Length Check (Double security)
    if (text.length > 280) {
        return alert("Your wish is too long. Please keep it under 280 characters.");
    }

    // C. SPAM DETECTION (The new Ninja logic) 🥷
    
    // Check 1: Repeated characters (e.g., "aaaaa", "wwwww")
    // This Regex looks for any character that repeats 5 times in a row
    if (/([a-zA-Z0-9\u1000-\u109F])\1{4,}/.test(text)) {
        return alert("Please write a real wish, not repeated letters.");
    }

    // Check 2: Keyboard mashing (common patterns)
    // We check if the text is one long word without spaces (only applies if length > 20)
    // Note: We skip this for Burmese because Burmese doesn't always use spaces.
    const isBurmese = /[\u1000-\u109F]/.test(text);
    if (!isBurmese && !text.includes(' ') && text.length > 20) {
         return alert("Please add spaces between words.");
    }

    // D. Bad Word Filter
    const hasBadWord = badWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
    if (hasBadWord) {
        alert("Please keep your wish positive and clean."); 
        return; 
    }

    try {
        // E. Save to Database
        const docRef = await addDoc(collection(db, "wishes"), {
            text: text,
            saduCount: 0,
            reportCount: 0,
            color: selectedColor,
            timestamp: Date.now()
        });
        
        localStorage.setItem('lastWishTime', Date.now());
        localStorage.setItem('myLanternId', docRef.id);
        findMyLanternBtn.classList.remove('hidden');

        createLantern({ 
            text: text, 
            saduCount: 0, 
            color: selectedColor 
        }, docRef.id);

        wishInput.value = ""; 
        alert("Your wish has been released to the sky!");
    } catch (e) {
        console.error("Error: ", e);
        alert("Could not save wish. Connection error.");
    }
});

// 5. Tracker Logic (Find My Lantern)
findMyLanternBtn.addEventListener('click', () => {
    const myId = localStorage.getItem('myLanternId');
    if (!myId) return;

    const myEl = document.getElementById(`lantern-${myId}`);
    if (myEl) {
        // Visual highlight effect
        myEl.classList.add('found-it');
        setTimeout(() => { myEl.classList.remove('found-it'); }, 3000);
    } else {
        alert("Your lantern has floated too high and disappeared into the stars... (Wait for it to cycle back!)");
    }
});

// --- 6. MODAL ACTIONS (Sadu & Report) ---

// Sadu (Like)
saduBtn.addEventListener('click', async () => {
    if (!currentOpenDocId) return;

    // 1. CHECK LOCAL STORAGE (Prevent duplicates)
    // We retrieve the list of IDs this user has already blessed
    const saduList = JSON.parse(localStorage.getItem('saduWishes') || "[]");
    
    if (saduList.includes(currentOpenDocId)) {
        alert("You have already said Sadu for this wish. 🙏");
        return; // Stop here
    }
    
    // 2. Optimistic Update (Visual)
    let currentCount = parseInt(saduCountDisplay.innerText);
    saduCountDisplay.innerText = currentCount + 1;
    saduBtn.style.transform = "scale(1.2)";
    setTimeout(() => saduBtn.style.transform = "scale(1)", 200);

    try {
        // 3. Update Database
        const wishRef = doc(db, "wishes", currentOpenDocId);
        await updateDoc(wishRef, { saduCount: increment(1) });

        // 4. SAVE TO LOCAL STORAGE
        // Add this specific ID to the list so they can't click it again
        saduList.push(currentOpenDocId);
        localStorage.setItem('saduWishes', JSON.stringify(saduList));

    } catch (e) { 
        console.error("Sadu Failed:", e);
        saduCountDisplay.innerText = currentCount; // Revert on fail
    }
});

// Report
reportBtn.addEventListener('click', async () => {
    if (!currentOpenDocId) return;
    
    // 1. CHECK LOCAL STORAGE
    const reportedItems = JSON.parse(localStorage.getItem('reportedWishes') || "[]");
    
    if (reportedItems.includes(currentOpenDocId)) {
        alert("You have already reported this wish.");
        return; // Stop here
    }

    if (!confirm("Are you sure you want to report this wish?")) return;

    try {
        // 2. Update Database
        const wishRef = doc(db, "wishes", currentOpenDocId);
        await updateDoc(wishRef, { reportCount: increment(1) });

        // 3. SAVE TO LOCAL STORAGE
        reportedItems.push(currentOpenDocId);
        localStorage.setItem('reportedWishes', JSON.stringify(reportedItems));

        alert("Thank you. We will review this.");
        modal.classList.add('hidden'); 
        currentOpenDocId = null;
    } catch (e) { 
        console.error("Report Failed:", e);
    }
});

// --- 7. REALTIME DATABASE LISTENER ---
const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"), limit(20));

onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const id = change.doc.id;
        
        // Remove from screen if reported
        if ((data.reportCount || 0) >= REPORT_THRESHOLD) {
            const el = document.getElementById(`lantern-${id}`);
            if (el) el.remove();
            return;
        }

        if (change.type === "added") {
            // Add to queue (Create later)
            // Note: We don't verify duplicates here because the Queue processor logic handles flow,
            // and createLantern prevents DOM duplicates.
            wishQueue.push({ data, id });
        } 
        else if (change.type === "modified") {
            // Update live lantern status (e.g. turning golden)
            const lanternEl = document.getElementById(`lantern-${id}`);
            if (lanternEl && (data.saduCount || 0) >= 10) {
                lanternEl.classList.add('golden');
            }
            // Update modal text if open
            if (currentOpenDocId === id) {
                saduCountDisplay.innerText = data.saduCount || 0;
            }
        }
    });
});

// Close Modal Logic
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    currentOpenDocId = null;
});

// --- INITIALIZATION ---
generateStars();
updateMoonPhase();