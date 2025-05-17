// === Simple Traffic Exchange Viewer with Credits and User Login ===

// Hardcoded sites list to visit (add your own sites here)
const sites = [
  "https://example.com",
  "https://news.ycombinator.com",
  "https://www.wikipedia.org",
  "https://stackoverflow.com"
];

// Timer duration per site (seconds)
const timeLimit = 20;

let currentIndex = 0;
let timeLeft = timeLimit;
let timerInterval = null;

// DOM Elements
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("login-error");

const userInfo = document.getElementById("user-info");
const displayUsername = document.getElementById("display-username");
const creditsEl = document.getElementById("credits");
const logoutBtn = document.getElementById("logoutBtn");

const viewerSection = document.getElementById("viewer-section");
const timerEl = document.getElementById("time");
const progressEl = document.getElementById("progress");
const iframe = document.getElementById("siteFrame");
const skipBtn = document.getElementById("skipBtn");

// Utility: Save user data in localStorage
function saveUserData(user) {
  localStorage.setItem("trafficop_user", JSON.stringify(user));
}

// Utility: Load user data
function loadUserData() {
  const userStr = localStorage.getItem("trafficop_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Initialize app
function init() {
  const user = loadUserData();
  if (user && user.username) {
    showUserSection(user);
    startViewing(user);
  } else {
    showLogin();
  }
}

// Show login form
function showLogin() {
  loginForm.classList.remove("hidden");
  userInfo.classList.add("hidden");
  viewerSection.classList.add("hidden");
}

// Show user info and viewer
function showUserSection(user) {
  displayUsername.textContent = user.username;
  creditsEl.textContent = user.credits || 0;
  loginForm.classList.add("hidden");
  userInfo.classList.remove("hidden");
  viewerSection.classList.remove("hidden");
  updateSkipButton(user.credits);
}

// Start the timer and iframe loading cycle
function startViewing(user) {
  loadSite(currentIndex);
  timerEl.textContent = timeLeft;
  progressEl.style.width = "0%";

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    const progressPercent = ((timeLimit - timeLeft) / timeLimit) * 100;
    progressEl.style.width = progressPercent + "%";

    if (timeLeft <= 0) {
      // Add 1 credit for viewing
      user.credits = (user.credits || 0) + 1;
      saveUserData(user);
      creditsEl.textContent = user.credits;

      // Move to next site
      currentIndex = (currentIndex + 1) % sites.length;
      loadSite(currentIndex);
      timeLeft = timeLimit;
      updateSkipButton(user.credits);
    }
  }, 1000);
}

// Load URL into iframe
function loadSite(index) {
  iframe.src = sites[index];
}

// Update Skip Button state
function updateSkipButton(credits) {
  if (credits > 0) {
    skipBtn.disabled = false;
  } else {
    skipBtn.disabled = true;
  }
}

// Login / Register user (just username, no password)
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    loginError.textContent = "Username cannot be empty.";
    return;
  }

  loginError.textContent = "";

  // Check if user exists or create new
  let user = loadUserData();
  if (!user || user.username !== username) {
    user = {
      username: username,
      credits: 0
    };
    saveUserData(user);
  }
  showUserSection(user);
  startViewing(user);
});

// Logout user
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("trafficop_user");
  location.reload();
});

// Skip current site button - spend 1 credit and go next
skipBtn.addEventListener("click", () => {
  let user = loadUserData();
  if (!user) return;

  if ((user.credits || 0) < 1) {
    alert("Not enough credits to skip.");
    return;
  }

  // Deduct credit and move to next site
  user.credits -= 1;
  saveUserData(user);
  creditsEl.textContent = user.credits;
  currentIndex = (currentIndex + 1) % sites.length;
  loadSite(currentIndex);
  timeLeft = timeLimit;
  timerEl.textContent = timeLeft;
  progressEl.style.width = "0%";
  updateSkipButton(user.credits);
});

// Initialize on page load
init();
