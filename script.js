/* Firebase configuration (compat style) */
const firebaseConfig = {
  apiKey: "AIzaSyCNyHMhKDDnUPmczrUsSbaU6O2QIskveW4",
  authDomain: "waste-reduction-ca922.firebaseapp.com",
  projectId: "waste-reduction-ca922",
  storageBucket: "waste-reduction-ca922.appspot.com",
  messagingSenderId: "134861993772",
  appId: "1:134861993772:web:576c4a8afd53afb8c65e89"
};

// initialize compat SDK
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

/* ---------- localStorage helpers ---------- */
const STORAGE_KEYS = {
 points: 'eco_points',
 pickups: 'eco_pickups',
 log: 'eco_log'
};

function getPoints(){ return parseInt(localStorage.getItem(STORAGE_KEYS.points)) || 0; }
function setPoints(v){ localStorage.setItem(STORAGE_KEYS.points, v); }
function addPoints(n){ setPoints(getPoints() + n); }

function getPickups(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.pickups) || '[]'); }
function savePickup(obj){ const arr = getPickups(); arr.push(obj); localStorage.setItem(STORAGE_KEYS.pickups, JSON.stringify(arr)); return arr; }

function getLog(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.log) || '[]'); }
function logActivity(msg){ const arr = getLog(); arr.push({ ts: new Date().toISOString(), msg }); localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(arr)); }

/* ---------- utility helpers ---------- */
function showToast(msg) {
 const container = document.getElementById('toast-container');
 if (!container) return;
 const t = document.createElement('div');
 t.className = 'toast';
 t.innerText = msg;
 container.appendChild(t);
 setTimeout(() => t.remove(), 3000);
}

function animateCounter(el, to) {
 let start = 0;
 const duration = 1000;
 const step = to / (duration / 16);
 function upd() {
 start += step;
 if (start < to) {
 el.innerText = Math.floor(start);
 requestAnimationFrame(upd);
 } else {
 el.innerText = to;
 }
 }
 upd();
}

/* ---------- original features ---------- */
function calculateDate() {
 const inputEl = document.getElementById('daysInput');
 const input = inputEl ? inputEl.value : '';
 const result = document.getElementById('dateResult');

 if (!input || input <= 0) {
 if (result) result.innerText = 'Enter valid days';
 return;
 }
 const today = new Date();
 today.setDate(today.getDate() + Number(input));
 if (result) result.innerText = 'Future Date: ' + today.toDateString();
}
function showDate() { calculateDate(); }

function requestPickup() {
 const name = document.getElementById('name')?.value || '';
 const waste = document.getElementById('pickupWaste')?.value || '';
 const pickupObj = {
 name, pickupWaste: waste, date: new Date().toLocaleDateString()
 };
 savePickup(pickupObj);
 addPoints(5);
 logActivity('Pickup requested for ' + waste);
 showToast('Pickup requested!');
 const status = document.getElementById('status');
 if (status) status.innerText = 'Request sent.';
 const list = document.getElementById('pickupList');
 if (list) {
 const li = document.createElement('li');
 li.textContent = `${pickupObj.name} - ${pickupObj.pickupWaste}`;
 list.appendChild(li);
 }
}

function uploadMedia() {
 const file = document.getElementById('mediaUpload')?.files[0];
 const status = document.getElementById('uploadStatus');
 if (!file) {
 showToast('Select a file');
 return;
 }
 const ref = storage.ref('uploads/' + file.name);
 const task = ref.put(file);
 task.on('state_changed',
 snap => {
 if (status) {
 const perc = ((snap.bytesTransferred / snap.totalBytes) * 100).toFixed(0);
 status.innerText = `Uploading ${perc}%`;
 }
 },
 err => {
 console.error(err);
 showToast('Upload Failed');
 if (status) status.innerText = '';
 },
 () => {
 if (status) status.innerText = 'Done';
 addPoints(10);
 logActivity('Media uploaded');
 showToast('Upload Successful');
 }
 );
}

/* aliases */
function saveData() {}
function uploadFile() { uploadMedia(); }

/* ---------- page load / interactions ---------- */
document.addEventListener('DOMContentLoaded', () => {
 // splash
 const splash = document.getElementById('splash');
 if (splash) setTimeout(() => splash.classList.add('hide'), 1000);

 // sidebar toggle
 const navToggle = document.getElementById('navToggle');
 const sidebar = document.querySelector('.sidebar');
 if (navToggle && sidebar) {
 navToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
 }

 // highlight active link
 const current = window.location.pathname.split('/').pop() || 'index.html';
 document.querySelectorAll('.nav-link').forEach(link => {
   const href = link.getAttribute('href');
   if (href === current || (current === '' && href === 'index.html')) {
     link.classList.add('active');
   } else {
     link.classList.remove('active');
   }
   link.addEventListener('click', () => {
     if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
   });
 });

 // reveal animations
 const observer = new IntersectionObserver((entries, obs) => {
 entries.forEach(e => {
 if (e.isIntersecting) {
 e.target.classList.add('visible');
 obs.unobserve(e.target);
 }
 });
 }, { threshold: 0.1 });
 document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

 // cursor
 initCursor();

 // simple validation feedback
 document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
 el.addEventListener('blur', () => {
 if (el.value.trim() === '') el.classList.add('error');
 else el.classList.remove('error');
 });
 });

 // page-specific startup
 if (current === 'dashboard.html') {
 const pts = getPoints();
 const span = document.querySelector('#points span');
 if (span) {
 span.innerText = pts;
 animateCounter(span, pts);
 }
 }
 if (current === 'pickup.html') {
   const list = document.getElementById('pickupList');
   if (list) {
     getPickups().forEach(p => {
       const li = document.createElement('li');
       li.textContent = `${p.name} - ${p.pickupWaste}`;
       list.appendChild(li);
     });
   }
 }
});

/* ---------- custom cursor ---------- */
function initCursor() {
 const cursor = document.getElementById('cursor');
 const trail = document.getElementById('trail');
 document.addEventListener('mousemove', e => {
 if (cursor) {
 cursor.style.left = e.clientX + 'px';
 cursor.style.top = e.clientY + 'px';
 }
 if (trail) {
 trail.style.left = e.clientX + 'px';
 trail.style.top = e.clientY + 'px';
 }
 });
}
