// State Management
const state = {
  userName: localStorage.getItem('meher_user_name') || 'Guest',
  userBio: localStorage.getItem('meher_user_bio') || 'Living in the moment ✨',
  callMinutes: parseInt(localStorage.getItem('meher_call_mins') || '15', 10),
  callTimerInterval: null,
  callSecondsElapsed: 0,
  isCalling: false
};

// DOM Elements - Screens
const profileScreen = document.getElementById('profileScreen');
const settingsScreen = document.getElementById('settingsScreen');
const talkTimeScreen = document.getElementById('talkTimeScreen');
const callOverlay = document.getElementById('callOverlay');
const dropdownMenu = document.getElementById('dropdownMenu');
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');

// Screen Visibility Helpers
function showScreen(screen) {
  screen.classList.add('active');
  dropdownMenu.classList.remove('active');
}

function hideScreen(screen) {
  screen.classList.remove('active');
}

// Header & Dropdown Triggers
document.getElementById('openProfileHeader').addEventListener('click', () => showScreen(profileScreen));
document.getElementById('closeProfileBtn').addEventListener('click', () => hideScreen(profileScreen));

const headerMenuBtn = document.getElementById('headerMenuBtn');
headerMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && e.target !== headerMenuBtn) {
    dropdownMenu.classList.remove('active');
  }
});

// Menu Action Items
document.getElementById('menuViewProfile').addEventListener('click', () => showScreen(profileScreen));
document.getElementById('menuSettings').addEventListener('click', () => showScreen(settingsScreen));
document.getElementById('closeSettingsBtn').addEventListener('click', () => hideScreen(settingsScreen));

// Recharge & Talktime Triggers
document.getElementById('openRenewBtn').addEventListener('click', () => showScreen(talkTimeScreen));
document.getElementById('rowTalkTime').addEventListener('click', () => {
  hideScreen(settingsScreen);
  showScreen(talkTimeScreen);
});
document.getElementById('closeTalkTimeBtn').addEventListener('click', () => hideScreen(talkTimeScreen));
// Lightbox Viewer
const galleryImages = document.querySelectorAll('.gallery-img');
galleryImages.forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxModal.classList.add('active');
  });
});

lightboxModal.addEventListener('click', () => {
  lightboxModal.classList.remove('active');
  lightboxImg.src = '';
});

// Sync User Profile
const userNameDisplay = document.getElementById('userNameDisplay');
const userBioDisplay = document.getElementById('userBioDisplay');
const userInitial = document.getElementById('userInitial');

function syncUserProfile() {
  userNameDisplay.textContent = state.userName;
  userBioDisplay.textContent = state.userBio;
  userInitial.textContent = state.userName.charAt(0).toUpperCase() || 'U';
}
syncUserProfile();

// Edit User Details
document.getElementById('editUserBtn').addEventListener('click', () => {
  const newName = prompt('Enter your name:', state.userName);
  if (newName && newName.trim()) {
    state.userName = newName.trim();
    localStorage.setItem('meher_user_name', state.userName);
  }
  const newBio = prompt('Enter your bio/status:', state.userBio);
  if (newBio !== null) {
    state.userBio = newBio.trim();
    localStorage.setItem('meher_user_bio', state.userBio);
  }
  syncUserProfile();
});

// Settings - API Config
document.getElementById('rowApiSettings').addEventListener('click', () => {
  const currentKey = localStorage.getItem('openrouter_api_key') || '';
  const apiKey = prompt('Enter your OpenRouter API Key:', currentKey);
  if (apiKey !== null) {
    localStorage.setItem('openrouter_api_key', apiKey.trim());
    alert('API configuration saved successfully!');
  }
});
