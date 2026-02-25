
// =====================================
// FIREBASE SETUP (ONLY THIS VERSION)
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyCNyHMhKDDnUPmczrUsSbaU6O2QIskveW4",
  authDomain: "waste-reduction-ca922.firebaseapp.com",
  projectId: "waste-reduction-ca922",
  storageBucket: "waste-reduction-ca922.firebasestorage.app",
  messagingSenderId: "134861993772",
  appId: "1:134861993772:web:576c4a8afd53afb8c65e89",
  measurementId: "G-4TL4SWRQR7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase Connected Successfully");


// =====================================
// POINT SYSTEM
// =====================================

let points = Number(localStorage.getItem("points")) || 0;
updatePoints();

function updatePoints(){
  localStorage.setItem("points", points);

  let el = document.getElementById("points");
  if(el){
    el.innerText = "Points: " + points;
  }
}

function addPoints(num){
  points += num;
  updatePoints();
}


// =====================================
// PAGE NAVIGATION
// =====================================

function showSection(id){

  document.querySelectorAll(".section")
    .forEach(sec => sec.classList.add("hidden"));

  let selected = document.getElementById(id);
  if(selected){
    selected.classList.remove("hidden");
  }
}


// =====================================
// COLLECTION DATE CALCULATOR
// =====================================

function showDate(){

  let type = document.getElementById("pickupWaste").value;

  if(type === ""){
    alert("Please select waste type");
    return;
  }

  let today = new Date();
  let todayDay = today.getDay();

  let targetDay;

  if(type === "plastic") targetDay = 1;
  if(type === "organic") targetDay = 3;
  if(type === "ewaste") targetDay = 5;

  let diff = targetDay - todayDay;
  if(diff <= 0) diff += 7;

  today.setDate(today.getDate() + diff);

  document.getElementById("dateResult").innerText =
    "Next Pickup: " + today.toDateString();
}


// =====================================
// REQUEST PICKUP + SAVE TO FIREBASE
// =====================================

function requestPickup(){

  let name = document.getElementById("name").value.trim();
  let address = document.getElementById("address").value.trim();
  let waste = document.getElementById("pickupWaste").value;

  if(name === "" || address === "" || waste === ""){
    alert("Please fill all fields");
    return;
  }

  db.collection("pickups").add({
    name: name,
    address: address,
    waste: waste,
    status: "Requested",
    time: new Date()
  })
  .then(()=>{

    document.getElementById("status").innerText =
      "Pickup Requested Successfully";

    addPoints(10);

  })
  .catch(err=>{
    console.error(err);
    alert("Error saving pickup request");
  });
}


// =====================================
// MEDIA UPLOAD TO FIREBASE STORAGE
// =====================================

function uploadMedia(){

  let input = document.getElementById("mediaUpload");
  let file = input.files[0];

  if(!file){
    alert("Please select a file");
    return;
  }

  let storageRef = storage.ref("uploads/" + file.name);

  storageRef.put(file)
  .then(()=>{

    document.getElementById("uploadStatus").innerText =
      "Uploaded successfully: " + file.name;

    addPoints(5);
    input.value = "";

  })
  .catch(err=>{
    console.error(err);
    alert("Upload failed");
  });
}