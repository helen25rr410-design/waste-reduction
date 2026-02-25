
// =====================================
// ECOTRACK FINAL SCRIPT
// =====================================


// ===============================
// POINTS SYSTEM
// ===============================

// Load saved points or start at 0
let points = Number(localStorage.getItem("points")) || 0;

// Show points when page loads
updatePoints();

function updatePoints(){

  // Save points
  localStorage.setItem("points", points);

  // Update UI safely
  let el = document.getElementById("points");
  if(el){
    el.innerText = "Points: " + points;
  }
}



// ===============================
// NAVIGATION SYSTEM
// ===============================

function showSection(id){

  // hide all sections
  document.querySelectorAll(".section")
    .forEach(sec => sec.classList.add("hidden"));

  // show selected section
  let selected = document.getElementById(id);
  if(selected){
    selected.classList.remove("hidden");
  }
}



// ===============================
// PICKUP DATE CALCULATOR
// ===============================

function showDate(){

  let type = document.getElementById("pickupWaste").value;

  if(type === ""){
    alert("Please select waste type");
    return;
  }

  let today = new Date();
  let todayDay = today.getDay();

  let targetDay;

  // Collection schedule
  if(type === "plastic") targetDay = 1;   // Monday
  if(type === "organic") targetDay = 3;   // Wednesday
  if(type === "ewaste") targetDay = 5;    // Friday

  // Calculate next collection day
  let diff = targetDay - todayDay;
  if(diff <= 0) diff += 7;

  today.setDate(today.getDate() + diff);

  document.getElementById("dateResult").innerText =
    "Next Pickup: " + today.toDateString();
}



// ===============================
// PICKUP REQUEST SYSTEM
// ===============================

function requestPickup(){

  let name = document.getElementById("name").value.trim();
  let address = document.getElementById("address").value.trim();
  let waste = document.getElementById("pickupWaste").value;

  if(name === "" || address === "" || waste === ""){
    alert("Please fill all fields");
    return;
  }

  document.getElementById("status").innerText =
    "Requested → Confirmed → Collected";

  // reward points
  points += 10;
  updatePoints();
}



// ===============================
// MEDIA UPLOAD SYSTEM
// ===============================

function uploadMedia(){

  let input = document.getElementById("mediaUpload");
  let file = input.files[0];

  if(!file){
    alert("Please select a file");
    return;
  }

  document.getElementById("uploadStatus").innerText =
    "Uploaded successfully: " + file.name;

  // reward points
  points += 5;
  updatePoints();

  // reset input
  input.value = "";
}