// State Management
const state = {
  userName: localStorage.getItem('meher_user_name') || 'Guest',
  userBio: localStorage.getItem('meher_user_bio') || 'Living in the moment ✨',
  callMinutes: parseInt(localStorage.getItem('meher_call_mins') || '15', 10),
  callTimerInterval: null,
  callSecondsElapsed: 0,
  isCalling: false
};

// DOM Elements - Navigation & Screens
const profileScreen = document.getElementById('profileScreen');
const settingsScreen = document.getElementById('settingsScreen');
const talkTimeScreen = document.getElementById('talkTimeScreen');
const callOverlay = document.getElementById('callOverlay');
const dropdownMenu = document.getElementById('dropdownMenu');
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');

// DOM Elements - Chat & Input
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const voiceMsgBtn = document.getElementById('voiceMsgBtn');

// Toggle Screen Visibility
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

// Close dropdown on outside click
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

// Floating Message Button in Profile
document.getElementById('profileDmBtn').addEventListener('click', () => {
  hideScreen(profileScreen);
  messageInput.focus();
});

// Photo Lightbox Viewer
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

// Update & Sync User Profile Details
const userNameDisplay = document.getElementById('userNameDisplay');
const userBioDisplay = document.getElementById('userBioDisplay');
const userInitial = document.getElementById('userInitial');

function syncUserProfile() {
  userNameDisplay.textContent = state.userName;
  userBioDisplay.textContent = state.userBio;
  userInitial.textContent = state.userName.charAt(0).toUpperCase() || 'U';
}

syncUserProfile();

// Edit User Name & Bio
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

// Get Formatted Timestamp
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Append Message to Chat
function appendMessage(text, sender = 'user') {
  const msgRow = document.createElement('div');
  msgRow.className = `msg-row ${sender}`;

  const msgBubble = document.createElement('div');
  msgBubble.className = 'msg-bubble';
  msgBubble.textContent = text;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'msg-time';
  timeSpan.textContent = getCurrentTime();

  msgBubble.appendChild(timeSpan);
  msgRow.appendChild(msgBubble);
  chatContainer.appendChild(msgRow);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show/Hide Typing Indicator
function setTyping(isTyping) {
  if (isTyping) {
    typingIndicator.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    typingIndicator.style.display = 'none';
  }
}

// Meher AI Setup (OpenRouter Integration)
const MEHER_SYSTEM_PROMPT = `
You are Meher, a 21-year-old Delhi University (North Campus) literature student.
- Personality: Witty, casual, warm, slight DU slang (e.g. 'yaar', 'sahi mein', 'arre', 'chai').
- Natural Hinglish flow.
- Keep responses compact (1-2 sentences maximum) like real WhatsApp texting.
- Never state that you are an AI or bot.
`;

const conversationHistory = [
  { role: "system", content: MEHER_SYSTEM_PROMPT }
];

async function triggerMeherReply(userMessage) {
  const apiKey = localStorage.getItem('openrouter_api_key');

  if (!apiKey) {
    setTyping(false);
    appendMessage("Pehle Settings mein ja kar OpenRouter API key enter karo!", 'meher');
    return;
  }

  setTyping(true);
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href || "http://localhost",
        "X-Title": "Meher Chat App"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: conversationHistory,
        max_tokens: 120,
        temperature: 0.8
      })
    });

    const data = await response.json();
    setTyping(false);

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content.trim();
      conversationHistory.push({ role: "assistant", content: reply });
      appendMessage(reply, 'meher');
    } else {
      appendMessage("Net issue lag raha hai yaar... ek baar dobara bolo?", 'meher');
    }
  } catch (error) {
    setTyping(false);
    console.error("API Error:", error);
    appendMessage("Server connect nahi ho pa raha, ek baar check kar lo.", 'meher');
  }
}

// Send Message Handler
function handleSendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  messageInput.value = '';
  
  triggerMeherReply(text);
}

sendBtn.addEventListener('click', handleSendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSendMessage();
  }
});

// Calling Screen Handlers
const startCallBtn = document.getElementById('startCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callStatusTimer = document.getElementById('callStatusTimer');
const balanceMinsDisplay = document.getElementById('balanceMinsDisplay');

function updateBalanceUI() {
  balanceMinsDisplay.textContent = `${state.callMinutes} Mins`;
  localStorage.setItem('meher_call_mins', state.callMinutes.toString());
}
updateBalanceUI();

function startCall() {
  if (state.callMinutes <= 0) {
    alert("Call balance khatam ho chuka hai! Please renew or recharge.");
    showScreen(talkTimeScreen);
    return;
  }

  state.isCalling = true;
  state.callSecondsElapsed = 0;
  callStatusTimer.textContent = "Connecting...";
  callOverlay.classList.add('active');

  setTimeout(() => {
    if (!state.isCalling) return;
    callStatusTimer.textContent = "00:00";
    
    state.callTimerInterval = setInterval(() => {
      state.callSecondsElapsed++;
      const mins = String(Math.floor(state.callSecondsElapsed / 60)).padStart(2, '0');
      const secs = String(state.callSecondsElapsed % 60).padStart(2, '0');
      callStatusTimer.textContent = `${mins}:${secs}`;

      // Deduct 1 minute every 60 seconds
      if (state.callSecondsElapsed % 60 === 0) {
        state.callMinutes = Math.max(0, state.callMinutes - 1);
        updateBalanceUI();
        if (state.callMinutes === 0) {
          endCall();
          alert("Call duration limit reached. Please recharge!");
        }
      }
    }, 1000);
  }, 1800);
}

function endCall() {
  state.isCalling = false;
  clearInterval(state.callTimerInterval);

    
