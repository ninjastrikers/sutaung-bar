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

// Global State
let wishQueue = [];          
let currentOpenDocId = null; 
let selectedColor = "orange"; // Default color
const MAX_LANTERNS = 15;     
const RELEASE_SPEED = 800;   
const REPORT_THRESHOLD = 5; 

// 0. Color Selection Logic
document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
        // Remove selected class from all
        document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
        // Add to clicked
        e.target.classList.add('selected');
        // Update variable
        selectedColor = e.target.getAttribute('data-color');
    });
});

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
    if (!id) return; 

    // Filter reported
    if ((wishData.reportCount || 0) >= REPORT_THRESHOLD) return;

    // Check duplicates
    const existingLantern = document.getElementById(`lantern-${id}`);
    const isPopular = (wishData.saduCount || 0) >= 10;

    if (existingLantern) {
        if (isPopular) existingLantern.classList.add('golden');
        return; 
    }

    const lantern = document.createElement('div');
    lantern.classList.add('lantern');
    lantern.id = `lantern-${id}`;
    
    // Apply Custom Color Class (e.g., .lantern.red)
    if (wishData.color && wishData.color !== 'orange') {
        lantern.classList.add(wishData.color);
    }

    // Check if it's MY lantern (From Local Storage)
    const myLanternId = localStorage.getItem('myLanternId');
    if (id === myLanternId) {
        lantern.classList.add('my-lantern');
        findMyLanternBtn.classList.remove('hidden'); // Show tracker button
    }
    
    if (isPopular) lantern.classList.add('golden');

    lantern.style.left = Math.random() * 90 + '%';
    lantern.style.bottom = '-50px';

    const duration = Math.random() * 15 + 25; 
    lantern.style.transition = `bottom ${duration}s linear`;

    // Click Event
    lantern.addEventListener('click', () => {
        currentOpenDocId = id; 
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
        if(item.id) createLantern(item.data, item.id);
    }
}, RELEASE_SPEED);

// 4. Release a Wish
const badWords = ["fuck", "dick", "sapat", "lee", "လီး", "စပတ်", "စောက်ဖုတ်", "လိုး", "စောက်ပတ်"];

releaseBtn.addEventListener('click', async () => {
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
        const docRef = await addDoc(collection(db, "wishes"), {
            text: text,
            saduCount: 0,
            reportCount: 0,
            color: selectedColor, // Save selected color
            timestamp: Date.now()
        });
        
        localStorage.setItem('lastWishTime', Date.now());
        
        // SAVE MY LANTERN ID
        localStorage.setItem('myLanternId', docRef.id);
        findMyLanternBtn.classList.remove('hidden'); // Show tracker button

        // Create immediately
        createLantern({ text: text, saduCount: 0, color: selectedColor }, docRef.id);

        wishInput.value = ""; 
        alert("Your wish has been released to the sky!");
    } catch (e) {
        console.error("Error: ", e);
        alert("Could not save wish.");
    }
});

// 5. Tracker Logic (Find My Lantern)
findMyLanternBtn.addEventListener('click', () => {
    const myId = localStorage.getItem('myLanternId');
    if (!myId) return;

    const myEl = document.getElementById(`lantern-${myId}`);
    if (myEl) {
        // Add visual effect
        myEl.classList.add('found-it');
        
        // Remove visual effect after 3 seconds
        setTimeout(() => {
            myEl.classList.remove('found-it');
        }, 3000);
    } else {
        alert("Your lantern has floated too high and disappeared into the stars...");
        findMyLanternBtn.classList.add('hidden'); // Hide button if gone
    }
});

// 6. Buttons Logic
saduBtn.addEventListener('click', async () => {
    if (!currentOpenDocId) return;
    
    let currentCount = parseInt(saduCountDisplay.innerText);
    saduCountDisplay.innerText = currentCount + 1;
    saduBtn.style.transform = "scale(1.2)";
    setTimeout(() => saduBtn.style.transform = "scale(1)", 200);

    try {
        const wishRef = doc(db, "wishes", currentOpenDocId);
        await updateDoc(wishRef, { saduCount: increment(1) });
    } catch (e) { 
        console.error("Sadu Failed:", e);
        saduCountDisplay.innerText = currentCount; 
    }
});

reportBtn.addEventListener('click', async () => {
    if (!currentOpenDocId) return;
    
    const reportedItems = JSON.parse(localStorage.getItem('reportedWishes') || "[]");
    if (reportedItems.includes(currentOpenDocId)) {
        alert("You have already reported this wish.");
        return;
    }

    if (!confirm("Are you sure you want to report this wish?")) return;

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
        alert("Report failed.");
    }
});

// 7. Realtime Listener
const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"), limit(50));

onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const id = change.doc.id;
        
        if ((data.reportCount || 0) >= REPORT_THRESHOLD) {
            const el = document.getElementById(`lantern-${id}`);
            if (el) el.remove();
            return;
        }

        if (change.type === "added") {
            wishQueue.push({ data, id });
        } 
        else if (change.type === "modified") {
            const lanternEl = document.getElementById(`lantern-${id}`);
            if (lanternEl && (data.saduCount || 0) >= 10) {
                lanternEl.classList.add('golden');
            }
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