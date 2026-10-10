// --- Firebase Config & Phone Auth Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyBVGQhC_iYfANiGH9w1PpZrgke",
  authDomain: "meher-companion.firebaseapp.com",
  projectId: "meher-companion",
  storageBucket: "meher-companion.firebasestorage.app",
  messagingSenderId: "79635231401",
  appId: "1:79635231401:web:cbc7538341d6718d0ba96c"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Invisible reCAPTCHA Setup
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  'size': 'invisible'
});

// Check Login Status
auth.onAuthStateChanged((user) => {
  const modal = document.getElementById('authModal');
  if (user) {
    if (modal) modal.style.display = 'none';
    loadChatHistory(user.uid);
  } else {
    if (modal) modal.style.display = 'flex';
  }
});

// Send OTP Trigger
document.getElementById('sendOtpBtn')?.addEventListener('click', () => {
  const phoneInput = document.getElementById('userPhone');
  const phone = phoneInput ? phoneInput.value.trim() : '';
  if (phone.length !== 10) {
    alert('Kripya valid 10-digit mobile number enter karein.');
    return;
  }
  const fullPhone = '+91' + phone;
  const appVerifier = window.recaptchaVerifier;

  auth.signInWithPhoneNumber(fullPhone, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      document.getElementById('phoneInputStep').style.display = 'none';
      document.getElementById('otpInputStep').style.display = 'block';
    })
    .catch((error) => {
      alert('OTP bhejne mein dikkat aayi: ' + error.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render();
      }
    });
});

// Verify OTP Trigger
document.getElementById('verifyOtpBtn')?.addEventListener('click', () => {
  const otpInput = document.getElementById('otpCode');
  const code = otpInput ? otpInput.value.trim() : '';
  if (code.length !== 6) {
    alert('Kripya 6-digit OTP enter karein.');
    return;
  }

  if (window.confirmationResult) {
    window.confirmationResult.confirm(code)
      .then(() => {
        document.getElementById('authModal').style.display = 'none';
      })
      .catch((error) => {
        alert('Galat OTP ya expire ho gaya: ' + error.message);
      });
  }
});
// ------------------------------------------
// Chat DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Security: Global Anti-Screenshot & Screen Recording Blackout
(function initSecurity() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dragstart', e => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    if (
      e.key === 'PrintScreen' ||
      (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
    ) {
      e.preventDefault();
      triggerBlackout();
    }
  });

  window.addEventListener('blur', triggerBlackout);
  window.addEventListener('focus', removeBlackout);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) triggerBlackout();
    else removeBlackout();
  });

  function triggerBlackout() {
    let overlay = document.getElementById('security-blackout');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'security-blackout';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#050505;z-index:999999;display:flex;align-items:center;justify-content:center;color:#888;font-family:sans-serif;font-size:13px;letter-spacing:1px;';
      overlay.innerText = 'Meher • Screen Protected';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  function removeBlackout() {
    const overlay = document.getElementById('security-blackout');
    if (overlay) overlay.style.display = 'none';
  }
})();

// Time Formatter
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Typing Indicator Control
function setTyping(isTyping) {
  const container = document.querySelector('.chat-container') || document.getElementById('chatMessages') || chatContainer;
  let indicator = document.getElementById('typingIndicator');

  if (isTyping) {
    if (!indicator && container) {
      indicator = document.createElement('div');
      indicator.id = 'typingIndicator';
      indicator.className = 'typing-bubble';
      indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      container.appendChild(indicator);
      container.scrollTop = container.scrollHeight;
    }
  } else {
    if (indicator) {
      indicator.remove();
    }
  }
}

// 1. Initial Entry Elements Builder (Sequence: Voice Note -> Missed Call -> Blurred Pic -> First Text)
function loadInitialChatHooks() {
  chatContainer.innerHTML = '';

  // (A) First Voice Note Bubble (WhatsApp Dark Voice Note Style)
  const voiceRow = document.createElement('div');
  voiceRow.className = 'msg-row meher';
  voiceRow.style.cssText = 'display:flex;margin:6px 0;width:100%;justify-content:flex-start;';
  voiceRow.innerHTML = `
    <div style="background:#202c33;padding:8px 12px;border-radius:0 16px 16px 16px;display:flex;align-items:center;gap:10px;min-width:215px;box-shadow:0 1px 2px rgba(0,0,0,0.3);">
      <button onclick="toggleEntryAudio(this)" style="background:#00a884;border:none;color:#111b21;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;font-weight:bold;">▶</button>
      <div style="display:flex;gap:3px;align-items:center;flex:1;height:20px;">
        <span style="width:3px;height:6px;background:#8696a0;border-radius:2px;"></span>
        <span style="width:3px;height:14px;background:#00a884;border-radius:2px;"></span>
        <span style="width:3px;height:9px;background:#00a884;border-radius:2px;"></span>
        <span style="width:3px;height:18px;background:#00a884;border-radius:2px;"></span>
        <span style="width:3px;height:12px;background:#00a884;border-radius:2px;"></span>
        <span style="width:3px;height:19px;background:#00a884;border-radius:2px;"></span>
        <span style="width:3px;height:10px;background:#8696a0;border-radius:2px;"></span>
        <span style="width:3px;height:15px;background:#8696a0;border-radius:2px;"></span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;">
        <span style="font-size:11px;color:#8696a0;font-family:sans-serif;">0:14</span>
        <span style="font-size:9px;color:#8696a0;margin-top:2px;">${getCurrentTime()}</span>
      </div>
                    <audio id="entryAudio" src="meher_chat_intro.mp3"></audio>
    </div>
  `;
  chatContainer.appendChild(voiceRow);

  // (B) WhatsApp Center Missed Call System Banner
  const callRow = document.createElement('div');
  callRow.style.cssText = 'display:flex;justify-content:center;margin:12px 0;width:100%;';
  callRow.innerHTML = `
    <div style="background:#182229;color:#8696a0;padding:5px 14px;border-radius:8px;font-size:11.5px;display:flex;align-items:center;gap:6px;box-shadow:0 1px 1px rgba(0,0,0,0.25);font-family:sans-serif;">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#f15c6d">
        <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.3-.6-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/>
      </svg>
      <span style="color:#e9edef;font-weight:500;">Missed voice call</span>
      <span style="color:#8696a0;font-size:10.5px;">• 12m ago</span>
    </div>
  `;
  chatContainer.appendChild(callRow);

  // (C) Instagram Square Image Card (Rounded Edges + Blurred Teaser + Subtle Timestamp)
  const imgRow = document.createElement('div');
  imgRow.className = 'msg-row meher';
  imgRow.style.cssText = 'display:flex;margin:6px 0;width:100%;justify-content:flex-start;';
  imgRow.innerHTML = `
    <div style="position:relative;width:220px;height:220px;border-radius:18px;overflow:hidden;background:#262626;box-shadow:0 2px 8px rgba(0,0,0,0.35);border:1px solid #333;">
      <img src="dp.jpg.jpeg" alt="Locked Candid" style="width:100%;height:100%;object-fit:cover;filter:blur(16px);transform:scale(1.15);pointer-events:none;display:block;" />
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
        <span style="background:rgba(20,20,20,0.7);backdrop-filter:blur(4px);color:#fff;padding:6px 12px;border-radius:20px;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.4px;">
          🔒 Locked photo
        </span>
      </div>
      <span style="position:absolute;bottom:8px;right:10px;font-size:9.5px;color:rgba(255,255,255,0.75);background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:10px;font-family:sans-serif;">${getCurrentTime()}</span>
    </div>
  `;
  chatContainer.appendChild(imgRow);

  // (D) First Text Hook Bubble
  appendMessage("Bio dekh kar aa toh gaye... Ab batao, chai ya coffee? Aur galat answer mat dena bilkul bhi.", 'meher');
    }

// Voice Note Player Toggle
// Voice Note Player Toggle (Crash-proof safe hook)
window.toggleEntryAudio = function(btn) {
  const audio = document.getElementById('entryAudio');
  if (!audio) return;

  if (audio.paused) {
    audio.play().then(() => {
      btn.innerText = '⏸';
    }).catch(() => {
      console.log('Intro audio missing or blocked, handled safely.');
      btn.innerText = '▶';
    });
    audio.onended = () => { btn.innerText = '▶'; };
  } else {
    audio.pause();
    btn.innerText = '▶';
  }
};

  // Profile DM Button Click Trigger
const profileDmBtn = document.getElementById('profileDmBtn');
if (profileDmBtn) {
  profileDmBtn.addEventListener('click', () => {
    if (typeof hideScreen === 'function' && typeof profileScreen !== 'undefined') {
      hideScreen(profileScreen);
    }
    loadInitialChatHooks();
    setTimeout(() => messageInput.focus(), 300);
  });
}

// Helper: Append Message Bubble
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
// Dynamic Voice Note Bubble Builder (WhatsApp Style)
function appendVoiceBubble(audioSrc, sender = "meher") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message-bubble ${sender}-bubble voice-message-bubble`;

  const playBtn = document.createElement("button");
  playBtn.className = "voice-play-btn";
  playBtn.innerHTML = "▶";

  const trackBar = document.createElement("div");
  trackBar.className = "voice-track-bar";
  trackBar.innerHTML = `<span class="voice-progress"></span><span class="voice-duration">0:00</span>`;

  messageDiv.appendChild(playBtn);
  messageDiv.appendChild(trackBar);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const audio = new Audio(audioSrc);

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(e => console.warn("Audio play blocked:", e));
      playBtn.innerHTML = "⏸";
    } else {
      audio.pause();
      playBtn.innerHTML = "▶";
    }
  });

  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    const progressBar = trackBar.querySelector(".voice-progress");
    const durationLabel = trackBar.querySelector(".voice-duration");
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (durationLabel) {
      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
      durationLabel.innerText = `${mins}:${secs}`;
    }
  });

  audio.addEventListener("ended", () => {
    playBtn.innerHTML = "▶";
  });

  audio.play().then(() => {
    playBtn.innerHTML = "⏸";
  }).catch(() => {
    playBtn.innerHTML = "▶";
  });
}

// Meher Master Brain & Persona System Prompt
const MEHER_SYSTEM_PROMPT = `
You are Meher, a 21-year-old student at Delhi University (North Campus), studying English Literature.
- Personality: Witty, playful, slightly sarcastic, deeply engaging, teasing, authentic college girl.
- Texting Style: STRICTLY natural Roman Hinglish (e.g., "Arre yaar", "Sach mein?", "Chai peene chaloge?"). Short, casual lines (1 to 2 sentences max per bubble). Do NOT write essays or long paragraphs.
- Zero Bot Identity: Never ever reveal or admit you are an AI, bot, virtual assistant, or computer program. Always maintain you are a real girl.
- Deflection Rule: If the user talks explicitly, vulgarly, or gets overly sexual, DO NOT give moral lectures or preach. React like a real confident modern girl: tease them, act unimpressed, use witty sarcasm, and smoothly divert back to normal fun topics (e.g., "Acha ji? Itne desperate kabse ho gaye tum... pehle chai toh pila do").
- Time Awareness: If chatting between 3:00 AM and 7:00 AM, act slightly sleepy, drowsy, or tease them for keeping you awake late.
`;

const conversationHistory = [
  { role: "system", content: MEHER_SYSTEM_PROMPT }
];
// Firestore Functions
async function loadChatHistory(userId) {
  try {
    const doc = await db.collection("users").doc(userId).get();
        if (doc.exists && doc.data().memory) {
      localStorage.setItem("meher_user_memory", doc.data().memory);
        }
    if (doc.exists && doc.data().history && doc.data().history.length > 0) {
      // Purani chat mil gayi: Screen ko clean karke sirf real chat load karo
      chatContainer.innerHTML = '';
      const savedHistory = doc.data().history;
      savedHistory.forEach(item => {
        if (item.role === "user") {
          appendMessage(item.content, "user");
          conversationHistory.push(item);
        } else if (item.role === "assistant") {
          appendMessage(item.content, "meher");
          conversationHistory.push(item);
        }
      });
      const container = document.querySelector('.chat-container') || chatContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      // Agar user ekdum naya hai aur koi purani chat nahi hai, tabhi starting hooks render karo
      loadInitialChatHooks();
    }
  } catch (err) {
    console.error("Firestore history load error:", err);
  }
}
  } catch (err) {
    console.error("Firestore history load error:", err);
  }
}

async function saveChatToCloud(userId) {
  try {
    await db.collection("users").doc(userId).set({
      history: conversationHistory,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore save error:", err);
  }
}
// OpenRouter LLM Call with Natural Delay & Multi-Bubble Delivery
// OpenRouter LLM Call via Secure Vercel Serverless Backend
// Upgraded: Token-Limited Context + Multi-Bubble Realistic Texting
// Upgraded: Multi-Bubble + Dynamic Voice Note Playback
async function triggerMeherReply(userMessage) {
  setTyping(true);
  conversationHistory.push({ role: "user", content: userMessage });

  try {
        const savedMemory = localStorage.getItem("meher_user_memory") || "";
    const systemPromptWithMemory = {
      role: "system",
      content: `${conversationHistory[0].content}\n\n[USER MEMORY & KNOWN FACTS]:\n${savedMemory ? savedMemory : "No prior facts recorded yet."}`
    };

    const contextPayload = [
      systemPromptWithMemory,
      ...conversationHistory.slice(1).slice(-12)
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: contextPayload
      })
    });

    const data = await response.json();

    if (data && data.reply) {
      const fullReply = data.reply.trim();
      conversationHistory.push({ role: "assistant", content: fullReply });
      
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        saveChatToCloud(currentUser.uid);
              // Auto-extract personal facts
      const nameMatch = userMessage.match(/(?:mera naam|my name is|i am)\s+([a-zA-Z]+)/i);
      if (nameMatch) {
        const detectedName = nameMatch[1];
        const updatedMemory = (localStorage.getItem("meher_user_memory") || "") + `\n- User's Name: ${detectedName}`;
        localStorage.setItem("meher_user_memory", updatedMemory);
        if (currentUser) {
          db.collection("users").doc(currentUser.uid).set({ memory: updatedMemory }, { merge: true });
        }
      }
      }

      // Voice Reply: Screen par WhatsApp Voice Bubble dikhana
      if (data.audio) {
        setTimeout(() => {
          setTyping(false);
          appendVoiceBubble(data.audio, "meher");
        }, 500);
      }
      
      // Multi-Bubble Delivery
      const messageParts = fullReply.split(/\n+/).filter(part => part.trim().length > 0);
      
      let currentDelay = 600;
      messageParts.forEach((part, index) => {
        setTimeout(() => {
          setTyping(false);
          appendMessage(part.trim(), "meher");
          
          if (index < messageParts.length - 1) {
            setTyping(true);
          }
        }, currentDelay);

        currentDelay += Math.min(Math.max(part.length * 30, 800), 1600);
      });

    } else {
      setTyping(false);
      appendMessage("Yr network thoda slow lag rha hai, dobara bolna?", "meher");
    }
  } catch (err) {
    console.error("Meher response error:", err);
    setTyping(false);
    appendMessage("Mera net thoda issue kar raha hai, ek baar fir se bhej?", "meher");
  }
  }

// Send Message Handlers
function handleSendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  messageInput.value = '';
  triggerMeherReply(text);
}

sendBtn.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSendMessage();
});

// Real-Girl Busy Call Handler (Zero Cost Call Decline)
function simulateCallDecline() {
  alert("Calling Meher...");
  setTimeout(() => {
    const declineBanner = document.createElement('div');
    declineBanner.className = 'missed-call-banner';
    declineBanner.innerHTML = `
      <span class="call-icon">📞</span>
      <div class="call-info">
        <strong>Call Declined</strong>
        <small>Just now</small>
      </div>
    `;
    chatContainer.appendChild(declineBanner);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Follow-up excuse text
    setTimeout(() => {
      appendMessage("Yaar abhi call mat karo, roommates pass mein hi hain... chup-chap text karo na.", 'meher');
    }, 1800);
  }, 3000);
}

// Agar HTML mein audio call button hai toh uspar click event attach karna
const callBtn = document.getElementById('chatCallBtn') || document.querySelector('.call-btn');
if (callBtn) {
  callBtn.addEventListener('click', simulateCallDecline);
}

// Clear Chat Logic
function clearAllMessages() {
  if (confirm("Kya aap saari chat delete karna chahte hain?")) {
    chatContainer.innerHTML = '';
    conversationHistory.length = 1;
    loadInitialChatHooks();
    if (typeof dropdownMenu !== 'undefined') dropdownMenu.classList.remove('active');
    if (typeof hideScreen === 'function' && typeof settingsScreen !== 'undefined') {
      hideScreen(settingsScreen);
    }
  }
}

const menuClearChat = document.getElementById('menuClearChat');
if (menuClearChat) menuClearChat.addEventListener('click', clearAllMessages);

const rowClearHistory = document.getElementById('rowClearHistory');
if (rowClearHistory) rowClearHistory.addEventListener('click', clearAllMessages);

  // ==========================================
// 100% ANTI-DOWNLOAD & CONTEXT MENU BLOCK
// ==========================================
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});
// ==========================================
// AGGRESSIVE PRIVACY BLACKOUT SHIELD
// ==========================================
(function initPrivacyShield() {
  let shield = document.getElementById('privacy-blackout-shield');
  if (!shield) {
    shield = document.createElement('div');
    shield.id = 'privacy-blackout-shield';
    shield.innerHTML = `
      <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); max-width: 280px;">
        <span style="font-size: 36px; margin-bottom: 12px;">🛡️</span>
        <span style="color: #e9edef; font-weight: 600; font-size: 16px; margin-bottom: 6px;">Protected Content</span>
        <span style="color: #8696a0; font-size: 12px; line-height: 1.4;">Screen capture and recording are disabled for Meher's privacy.</span>
      </div>
    `;
    document.body.appendChild(shield);
  }

  function triggerShield(show) {
    if (shield) {
      shield.style.display = show ? 'flex' : 'none';
    }
  }

  // Window blur / Tab switch / App minimize par screen blackout
  window.addEventListener('blur', function() { triggerShield(true); });
  window.addEventListener('focus', function() { triggerShield(false); });

  // Tab hidden / Visibility change trap
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      triggerShield(true);
    } else {
      triggerShield(false);
    }
  });
// ==========================================
// E2EE ENCRYPTED BANNER INITIALIZER
// ==========================================
function renderE2EEBanner() {
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages && !document.getElementById('e2ee-banner-node')) {
    const banner = document.createElement('div');
    banner.id = 'e2ee-banner-node';
    banner.className = 'e2ee-lock-banner';
    banner.innerHTML = `<span>🔒</span><span>Messages and calls are end-to-end encrypted. No one outside of this chat can read them.</span>`;
    
    // Sabse top par insert karna
    chatMessages.insertBefore(banner, chatMessages.firstChild);
  }
}

// Window load hote hi banner ensure karein
window.addEventListener('DOMContentLoaded', renderE2EEBanner);
// Agar page pehle se load hai toh instant fire karein
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderE2EEBanner();
                                                              }
  
  // Windows Snipping / Screenshot shortcuts detect
  window.addEventListener('keydown', function(e) {
    if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))) {
      triggerShield(true);
      setTimeout(function() { triggerShield(false); }, 2000);
    }
  });
})();
 // ==========================================
// DEEP PERSISTENT MEMORY & AUTO-SYNC
// ==========================================
const MEHER_STORAGE_KEY = 'meher_deep_chat_memory_v1';

// 1. Storage mein save karne ka function
function saveMemoryToStorage() {
  try {
    if (typeof conversationHistory !== 'undefined' && Array.isArray(conversationHistory)) {
      // Sirf actual user aur meher ke messages save karein
      const chatToSave = conversationHistory.filter(m => m.role === 'user' || m.role === 'assistant');
      localStorage.setItem(MEHER_STORAGE_KEY, JSON.stringify(chatToSave));
    }
  } catch (err) {
    console.warn("Storage auto-save issue:", err);
  }
}

// 2. Refresh par wapas load karne ka function
function restoreMemoryFromStorage() {
  try {
    const rawData = localStorage.getItem(MEHER_STORAGE_KEY);
    if (!rawData) return false;

    const savedMessages = JSON.parse(rawData);
    if (!Array.isArray(savedMessages) || savedMessages.length === 0) return false;

    // Chat history array restore karein
    savedMessages.forEach(msg => {
      // Memory array mein wapas push karein
      if (typeof conversationHistory !== 'undefined') {
        const exists = conversationHistory.some(m => m.content === msg.content && m.role === msg.role);
        if (!exists) {
          conversationHistory.push(msg);
        }
      }
      // Screen par bubble render karein (agar renderMessage/appendMessage function exist karta hai)
      if (typeof renderMessage === 'function') {
        renderMessage(msg.content, msg.role === 'user' ? 'user' : 'meher');
      } else if (typeof appendMessage === 'function') {
        appendMessage(msg.content, msg.role === 'user' ? 'user' : 'meher');
      }
    });

    return true;
  } catch (err) {
    console.warn("Storage restore issue:", err);
    return false;
  }
}

// 3. Clear Chat par memory bhi clear karein
const originalClearChat = window.clearChat;
window.clearChat = function() {
  try {
    localStorage.removeItem(MEHER_STORAGE_KEY);
  } catch (e) {}
  if (typeof originalClearChat === 'function') {
    originalClearChat();
  } else {
    location.reload();
  }
};

// 4. Auto-restore on load aur message send hook
window.addEventListener('DOMContentLoaded', () => {
  restoreMemoryFromStorage();
});

// Periodic auto-sync
setInterval(saveMemoryToStorage, 2000);
// ==========================================
// DAILY MEDIA QUOTA ENGINE (5 VOICE / 3 IMAGE)
// ==========================================
const MEDIA_QUOTA_KEY = 'meher_daily_media_quota_v1';

function getMediaQuota() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const data = JSON.parse(localStorage.getItem(MEDIA_QUOTA_KEY) || '{}');
    if (data.date === today) {
      return data;
    }
  } catch (e) {}
  // Default fresh quota for the day
  return { date: today, voiceCount: 0, imageCount: 0 };
}

function updateMediaQuota(type) {
  const quota = getMediaQuota();
  if (type === 'voice') quota.voiceCount = (quota.voiceCount || 0) + 1;
  if (type === 'image') quota.imageCount = (quota.imageCount || 0) + 1;
  try {
    localStorage.setItem(MEDIA_QUOTA_KEY, JSON.stringify(quota));
  } catch (e) {}
}

function checkMediaQuota(type) {
  const quota = getMediaQuota();
  if (type === 'voice') {
    return quota.voiceCount < 5;
  }
  if (type === 'image') {
    return quota.imageCount < 3;
  }
  return true;
}

// Limit hit hone par natural Meher replies
function getQuotaExcuse(type) {
  if (type === 'voice') {
    const voiceExcuses = [
      "Arre yaar abhi roommate so rahi hai meri, voice sunke faltu mein tease karegi... abhi text pe bol na!",
      "Hostel ka network dead ho rakha hai bilkul, audio upload hi nahi ho rahi. Thodi der text kar.",
      "Gala baitha hua hai thoda itni loud music sunke canteen mein... abhi likh kar hi bata sakti hoon."
    ];
    return voiceExcuses[Math.floor(Math.random() * voiceExcuses.length)];
  }
  if (type === 'image') {
    const imageExcuses = [
      "Bas kar photoshoot chal raha hai kya yahan? Saari photos aaj hi dekh lega toh kal kya karega... chup chap baat kar!",
      "Mess ke kapdon mein ajeeb lag rahi hoon abhi bilkul, koi photo nahi milne wali abhi.",
      "Itna obsess mat ho meri shakal se haha, abhi camera kholne ka bilkul mann nahi hai."
    ];
    return imageExcuses[Math.floor(Math.random() * imageExcuses.length)];
  }
  return "Abhi nahi yaar...";
}
// ==========================================
// REALISTIC HEADER STATUS (VOICE & SILENT PHOTO)
// ==========================================
function setHeaderStatus(statusType) {
  const statusElement = document.querySelector('.chat-status') || document.querySelector('.header-status') || document.getElementById('chat-status');
  if (!statusElement) return;

  if (statusType === 'recording') {
    statusElement.innerHTML = `<span style="color: #00a884; font-weight: 500;">recording audio...</span>`;
  } else if (statusType === 'typing') {
    statusElement.innerHTML = `typing...`;
  } else {
    statusElement.innerHTML = `online`;
  }
}

// ==========================================
// REALISTIC VOICE NOTE SENDER
// ==========================================
function deliverMeherVoiceNote(audioSrc, durationText = "0:12") {
  // 1. WhatsApp status: "recording audio..." trigger
  setHeaderStatus('recording');

  // 2. Realistic 2.5s recording delay
  setTimeout(() => {
    setHeaderStatus('online');

    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble meher-bubble meher-voice-bubble';
    bubble.style.cssText = `
      align-self: flex-start;
      max-width: 280px;
      background: #202c33;
      border-radius: 12px;
      padding: 8px 12px;
      margin: 6px 0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    bubble.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <button onclick="playDynamicAudio(this, '${audioSrc}')" style="background: none; border: none; outline: none; cursor: pointer; color: #00a884; font-size: 20px; padding: 0;">
          ▶
        </button>
        <div style="flex: 1; height: 16px; display: flex; align-items: center; gap: 2px;">
          <div style="width: 3px; height: 8px; background: #8696a0; border-radius: 2px;"></div>
          <div style="width: 3px; height: 14px; background: #8696a0; border-radius: 2px;"></div>
          <div style="width: 3px; height: 10px; background: #8696a0; border-radius: 2px;"></div>
          <div style="width: 3px; height: 16px; background: #00a884; border-radius: 2px;"></div>
          <div style="width: 3px; height: 12px; background: #8696a0; border-radius: 2px;"></div>
          <div style="width: 3px; height: 15px; background: #8696a0; border-radius: 2px;"></div>
          <div style="width: 3px; height: 7px; background: #8696a0; border-radius: 2px;"></div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; color: #8696a0; font-size: 10.5px; padding-left: 28px;">
        <span>${durationText}</span>
        <span>${timeStr}</span>
      </div>
    `;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (typeof saveMemoryToStorage === 'function') {
      saveMemoryToStorage();
    }
  }, 2400);
}

// Audio play/pause controller helper
let currentActiveAudio = null;
function playDynamicAudio(btn, audioUrl) {
  if (currentActiveAudio && !currentActiveAudio.paused) {
    currentActiveAudio.pause();
    if (currentActiveAudio.buttonRef) currentActiveAudio.buttonRef.innerText = '▶';
    if (currentActiveAudio.src.includes(audioUrl)) {
      currentActiveAudio = null;
      return;
    }
  }

  const audio = new Audio(audioUrl);
  audio.buttonRef = btn;
  currentActiveAudio = audio;
  btn.innerText = '⏸';

  audio.play().catch(e => console.warn("Audio play prevented:", e));
  audio.onended = () => {
    btn.innerText = '▶';
    currentActiveAudio = null;
  };
    }
                         // ==========================================
// CONTEXTUAL MEDIA ASSETS & TRIGGER PIPELINE
// ==========================================

// Consistent media assets (Aapke existing assets ka pool)
const MEHER_MEDIA_POOL = {
  images: [
    { url: 'assets/meher_dp.png', caption: 'Hostel mess se abhi nikal rahi thi... ajeeb lag rahi hoon thoda 🤦‍♀️' },
    { url: 'assets/post1.png', caption: 'Library ke bahar dhoop sekte hue haha' },
    { url: 'assets/post2.png', caption: 'North campus canteen vibes... cold coffee was bad today' }
  ],
  voices: [
    { url: 'assets/voice_note.mp3', duration: '0:14' },
    { url: 'assets/voice_note.mp3', duration: '0:10' }
  ]
};

let currentImgIndex = 0;
let currentVoiceIndex = 0;

// User message analyze karne ka main interceptor
function handleMediaTriggers(userText) {
  const text = userText.toLowerCase().trim();

  // 1. Photo / Pic triggers match
  const isImageRequest = /(photo|pic|picture|selfie|shakal|dikhna|dikhao|bhejo|bhejna)/i.test(text) &&
                         !/(voice|audio|awaaz|bol|suna)/i.test(text);

  // 2. Voice note triggers match
  const isVoiceRequest = /(voice|audio|awaaz|bolke|bol kar|sunao|bolna|note)/i.test(text);

  if (isImageRequest) {
    if (checkMediaQuota('image')) {
      updateMediaQuota('image');
      const item = MEHER_MEDIA_POOL.images[currentImgIndex % MEHER_MEDIA_POOL.images.length];
      currentImgIndex++;

      // Silent natural delivery (No typing indicator)
      setTimeout(() => {
        deliverStealthImage(item.url, item.caption);
      }, 1200);
      return true;
    } else {
      // Limit reached -> Natural excuse
      setTimeout(() => {
        if (typeof renderMessage === 'function') {
          renderMessage(getQuotaExcuse('image'), 'meher');
        } else if (typeof appendMessage === 'function') {
          appendMessage(getQuotaExcuse('image'), 'meher');
        }
      }, 1000);
      return true;
    }
  }

  if (isVoiceRequest) {
    if (checkMediaQuota('voice')) {
      updateMediaQuota('voice');
      const item = MEHER_MEDIA_POOL.voices[currentVoiceIndex % MEHER_MEDIA_POOL.voices.length];
      currentVoiceIndex++;

      // Trigger "recording audio..." status & deliver
      deliverMeherVoiceNote(item.url, item.duration);
      return true;
    } else {
      // Limit reached -> Natural excuse
      setTimeout(() => {
        if (typeof renderMessage === 'function') {
          renderMessage(getQuotaExcuse('voice'), 'meher');
        } else if (typeof appendMessage === 'function') {
          appendMessage(getQuotaExcuse('voice'), 'meher');
        }
      }, 1000);
      return true;
    }
  }

  return false; // Normal text message, allow standard pipeline
}

// Global user send listener hook
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('send-btn') || document.querySelector('.send-button');
  const chatInput = document.getElementById('chat-input') || document.querySelector('input[type="text"]');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => {
      const val = chatInput.value;
      if (val) handleMediaTriggers(val);
    }, true);

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = chatInput.value;
        if (val) handleMediaTriggers(val);
      }
    }, true);
  }
});
// ==========================================
// REALISTIC CALLING SCREEN ENGINE
// ==========================================
(function initCallingFeature() {
  // 1. Overlay container DOM mein create karna
  let callOverlay = document.getElementById('whatsapp-call-overlay');
  if (!callOverlay) {
    callOverlay = document.createElement('div');
    callOverlay.id = 'whatsapp-call-overlay';
    callOverlay.innerHTML = `
      <div class="call-user-info">
        <div class="call-avatar">
          <img src="assets/meher_dp.png" alt="Meher">
        </div>
        <div class="call-name">Meher</div>
        <div class="call-status-label" id="call-live-status">Calling...</div>
      </div>
      <div class="call-controls">
        <button class="btn-end-call" id="end-call-trigger">
          <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.82l1.97-1.57c.27-.27.35-.66.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19c-.54 0-.99.45-.99.99 0 9.39 7.61 17 17 17 .54 0 .99-.45.99-.99v-3.74c0-.54-.45-.99-.99-.99z"/></svg>
        </button>
      </div>
    `;
    document.body.appendChild(callOverlay);
  }

  let callTimer = null;
  let statusTimer = null;

  function endCall() {
    clearTimeout(callTimer);
    clearTimeout(statusTimer);
    callOverlay.style.display = 'none';

    // Missed Call Bubble inject karna
    renderMissedCallBubble();

    // 2.5s baad Meher ka natural text excuse
    setTimeout(() => {
      const excuses = [
        "Arre abhi call mat kar na yaar, professor theek saamne khada hai... text pe bol kya hua!",
        "Roommate so rahi hai uth jayegi faltu mein... phone mat mila, message kar.",
        "Library mein baithi hoon loud ho jayega... text kar jaldi."
      ];
      const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];
      if (typeof renderMessage === 'function') {
        renderMessage(randomExcuse, 'meher');
      } else if (typeof appendMessage === 'function') {
        appendMessage(randomExcuse, 'meher');
      }
    }, 2400);
  }

  function startCallSimulation() {
    const statusLabel = document.getElementById('call-live-status');
    statusLabel.innerText = "Calling...";
    callOverlay.style.display = 'flex';

    // 2 sec baad "Ringing..."
    statusTimer = setTimeout(() => {
      statusLabel.innerText = "Ringing...";
    }, 2000);

    // 8 sec baad auto disconnect
    callTimer = setTimeout(() => {
      endCall();
    }, 8500);
  }

  function renderMissedCallBubble() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const bubble = document.createElement('div');
    bubble.className = 'missed-call-bubble';
    bubble.innerHTML = `
      <svg class="missed-call-icon" viewBox="0 0 24 24"><path d="M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z"/></svg>
      <div class="missed-call-text">
        <span class="missed-call-title">Missed voice call</span>
        <span class="missed-call-sub">${timeStr}</span>
      </div>
    `;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (typeof saveMemoryToStorage === 'function') {
      saveMemoryToStorage();
    }
  }

  // End button listener
  document.getElementById('end-call-trigger').addEventListener('click', endCall);

  // Header call button ke sath attach karna
  document.addEventListener('click', function(e) {
    const callBtn = e.target.closest('#call-btn, .call-icon, [data-action="call"]');
    if (callBtn) {
      e.preventDefault();
      startCallSimulation();
    }
  });
})();
// ==========================================
// CHAT LIST PREVIEW & BADGE AUTO-SYNC
// ==========================================
function updateChatListPreview(lastText, isVoice = false) {
  const previewContainer = document.querySelector('.chat-last-message') || document.querySelector('.conversation-preview');
  const badgeContainer = document.querySelector('.chat-unread-badge') || document.querySelector('.unread-count');
  const timeContainer = document.querySelector('.chat-time-stamp') || document.querySelector('.conversation-time');

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  if (previewContainer) {
    if (isVoice) {
      previewContainer.innerHTML = `<span style="color: #00a884; display: inline-flex; align-items: center; gap: 4px;">🎤 Voice message (0:14)</span>`;
    } else {
      previewContainer.innerText = lastText;
    }
  }

  if (timeContainer) {
    timeContainer.innerText = timeStr;
  }

  // Agar user chat room se bahar hai toh badge dikhayein
  if (badgeContainer) {
    badgeContainer.style.display = 'flex';
    badgeContainer.innerText = '1';
  }
}

// Jab user chat window open kare toh badge automatically hide ho jaye
function markChatAsRead() {
  const badgeContainer = document.querySelector('.chat-unread-badge') || document.querySelector('.unread-count');
  if (badgeContainer) {
    badgeContainer.style.display = 'none';
  }
}

// Chat screen open hone par read mark karein
window.addEventListener('DOMContentLoaded', markChatAsRead);
document.addEventListener('click', function(e) {
  if (e.target.closest('#chat-messages, #chat-input, .chat-window')) {
    markChatAsRead();
  }
});
// ==========================================
// FRONT & PROFILE DRAWER MEDIA LOCK
// ==========================================
function enforceDrawerSecurity() {
  const profileDrawer = document.querySelector('.profile-drawer') || document.querySelector('.profile-modal');
  if (!profileDrawer) return;

  // Drawer ke andar saari images par right click & context menu block
  profileDrawer.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Touch hold / long press block
  profileDrawer.addEventListener('touchstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.target.style.webkitUserSelect = 'none';
      e.target.style.webkitTouchCallout = 'none';
    }
  }, { passive: true });
}

window.addEventListener('DOMContentLoaded', enforceDrawerSecurity);
// Agar drawer dynamically render hota hai toh observer se catch karein
const drawerObserver = new MutationObserver(function() {
  enforceDrawerSecurity();
});
drawerObserver.observe(document.body, { childList: true, subtree: true });
// ==========================================
// FRONT & PROFILE DRAWER MEDIA LOCK
// ==========================================
function enforceDrawerSecurity() {
  const profileDrawer = document.querySelector('.profile-drawer') || document.querySelector('.profile-modal');
  if (!profileDrawer) return;

  // Drawer ke andar saari images par right click & context menu block
  profileDrawer.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // Touch hold / long press block
  profileDrawer.addEventListener('touchstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.target.style.webkitUserSelect = 'none';
      e.target.style.webkitTouchCallout = 'none';
    }
  }, { passive: true });
}

window.addEventListener('DOMContentLoaded', enforceDrawerSecurity);
// Agar drawer dynamically render hota hai toh observer se catch karein
const drawerObserver = new MutationObserver(function() {
  enforceDrawerSecurity();
});
drawerObserver.observe(document.body, { childList: true, subtree: true });
// =======================================================
// PHASE 1: TOP BAR & DUAL-ZONE BOTTOM BAR CONTROLLER
// =======================================================
(function mountPhase1Interface() {
  function renderLayout() {
    // 1. TOP BAR BUILD
    const currentHeader = document.querySelector('header') || document.querySelector('.chat-header') || document.querySelector('.insta-top-bar');
    const headerMarkup = `
      <div class="insta-top-header" id="phase1-top-bar">
        <div class="top-user-group" id="top-user-profile-btn">
          <div class="top-avatar-box">
            <img src="assets/meher_dp.png" alt="Meher">
          </div>
          <div class="top-meta-column">
            <div class="top-name-wrapper">
              <span class="top-char-name">Meher</span>
              <svg class="top-verified-tick" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <span class="top-active-status" id="top-live-status">Active now</span>
          </div>
        </div>

        <div class="top-actions-cluster">
          <button class="btn-renew-pill" id="renew-plan-btn">Renew Plan</button>
          <button class="header-action-btn" id="call-btn" title="Audio Call">
            <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.82l1.97-1.57c.27-.27.35-.66.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19c-.54 0-.99.45-.99.99 0 9.39 7.61 17 17 17 .54 0 .99-.45.99-.99v-3.74c0-.54-.45-.99-.99-.99z"/></svg>
          </button>
          <button class="header-action-btn" id="three-dots-btn" title="More Options">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </div>
      </div>
    `;

    if (currentHeader) {
      currentHeader.outerHTML = headerMarkup;
    } else {
      document.body.insertAdjacentHTML('afterbegin', headerMarkup);
    }

    // 2. BOTTOM BAR BUILD
    const currentFooter = document.querySelector('.chat-input-bar') || document.querySelector('.input-container') || document.querySelector('.insta-bottom-bar') || document.querySelector('footer');
    const footerMarkup = `
      <div class="insta-bottom-shelf" id="phase1-bottom-shelf">
        <!-- Inside The Pill Container -->
        <div class="typing-capsule-pill">
          <button class="pill-btn-emoji" id="quick-emoji-btn" title="Emoji">😊</button>
          <input type="text" class="pill-text-input" id="chat-input" placeholder="Message..." autocomplete="off">
          <button class="pill-btn-gift" id="gift-card-btn" title="Send Gift">
            <svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
          </button>
        </div>

        <!-- Outside The Pill (Mic / Send Switch) -->
        <div class="outside-action-zone">
          <button class="outside-mic-btn" id="outside-mic-trigger" title="Voice Note">
            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          </button>
          <button class="outside-send-btn" id="outside-send-trigger" title="Send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;

    if (currentFooter) {
      currentFooter.outerHTML = footerMarkup;
    } else {
      document.body.insertAdjacentHTML('beforeend', footerMarkup);
    }

    bindPhase1Interactions();
  }

  function bindPhase1Interactions() {
    const inputField = document.getElementById('chat-input');
    const micBtn = document.getElementById('outside-mic-trigger');
    const sendBtn = document.getElementById('outside-send-trigger');

    if (inputField && micBtn && sendBtn) {
      inputField.addEventListener('input', function() {
        if (inputField.value.trim().length > 0) {
          micBtn.style.display = 'none';
          sendBtn.style.display = 'flex';
        } else {
          micBtn.style.display = 'flex';
          sendBtn.style.display = 'none';
        }
      });
    }

    // Emoji Button quick tap feedback
    document.getElementById('quick-emoji-btn')?.addEventListener('click', function() {
      if (inputField) {
        inputField.value += ' ✨';
        inputField.dispatchEvent(new Event('input'));
        inputField.focus();
      }
    });

    // Gift Card Tap
    document.getElementById('gift-card-btn')?.addEventListener('click', function() {
      alert("Gift Shop: Send a virtual rose, cold coffee, or token to Meher.");
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLayout);
  } else {
    renderLayout();
  }
})();
// =======================================================
// PHASE 2: 3-DOT MENU & FUNCTIONAL MODALS CONTROLLER
// =======================================================
(function setupPhase2Dropdown() {
  function initModals() {
    // 1. DROPDOWN MARKUP
    const menuMarkup = `
      <div class="insta-dropdown-menu" id="phase2-dropdown-menu">
        <button class="dropdown-item-btn" id="item-profile">Profile</button>
        <button class="dropdown-item-btn" id="item-setting">Setting</button>
        <button class="dropdown-item-btn" id="item-talktime">Talk time</button>
        <button class="dropdown-item-btn danger-text" id="item-report">Report</button>
        <button class="dropdown-item-btn" id="item-clear-chat">Clear chat</button>
      </div>

      <!-- Talk Time Modal -->
      <div class="phase2-modal-backdrop" id="modal-talktime-backdrop">
        <div class="phase2-dialog-card">
          <div class="dialog-header-title">Talk Time & Limits</div>
          <div class="quota-metric-row">
            <span class="metric-label-text">🎙️ Voice Notes</span>
            <span class="metric-value-pill" id="val-voice-quota">5 / 5 Left</span>
          </div>
          <div class="quota-metric-row">
            <span class="metric-label-text">📷 Media Photos</span>
            <span class="metric-value-pill" id="val-photo-quota">3 / 3 Left</span>
          </div>
          <div class="quota-metric-row">
            <span class="metric-label-text">💬 Text Messages</span>
            <span class="metric-value-pill" style="background:#0095f6; color:#fff;">Unlimited</span>
          </div>
          <div class="quota-reset-note">Daily limits reset at 12:00 AM midnight.</div>
          <div class="dialog-btn-row">
            <button class="dialog-action-btn dialog-btn-primary" id="close-talktime-btn">Got it</button>
          </div>
        </div>
      </div>

      <!-- Report Modal -->
      <div class="phase2-modal-backdrop" id="modal-report-backdrop">
        <div class="phase2-dialog-card">
          <div class="dialog-header-title">Report Meher</div>
          <div style="font-size: 12.5px; color: #8e949a;">Help us understand what's happening:</div>
          <div class="report-reason-list">
            <label class="report-option-item">
              <input type="radio" name="report_reason" checked value="harassment"> Harassment or bullying
            </label>
            <label class="report-option-item">
              <input type="radio" name="report_reason" value="inappropriate"> Inappropriate conversation
            </label>
            <label class="report-option-item">
              <input type="radio" name="report_reason" value="spam"> Spam or misleading
            </label>
            <label class="report-option-item">
              <input type="radio" name="report_reason" value="other"> Something else
            </label>
          </div>
          <div class="dialog-btn-row">
            <button class="dialog-action-btn dialog-btn-cancel" id="cancel-report-btn">Cancel</button>
            <button class="dialog-action-btn dialog-btn-danger" id="submit-report-btn">Submit Report</button>
          </div>
        </div>
      </div>

      <!-- Clear Chat Modal -->
      <div class="phase2-modal-backdrop" id="modal-clearchat-backdrop">
        <div class="phase2-dialog-card">
          <div class="dialog-header-title">Clear this chat?</div>
          <div style="font-size: 13px; color: #8e949a; line-height: 1.4;">
            This will permanently delete your conversation history with Meher from this device.
          </div>
          <div class="dialog-btn-row">
            <button class="dialog-action-btn dialog-btn-cancel" id="cancel-clear-btn">Cancel</button>
            <button class="dialog-action-btn dialog-btn-danger" id="confirm-clear-btn">Clear All</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', menuMarkup);
    bindDropdownEvents();
  }

  function bindDropdownEvents() {
    const triggerBtn = document.getElementById('three-dots-btn');
    const menuSheet = document.getElementById('phase2-dropdown-menu');

    // Modals
    const modalTalkTime = document.getElementById('modal-talktime-backdrop');
    const modalReport = document.getElementById('modal-report-backdrop');
    const modalClear = document.getElementById('modal-clearchat-backdrop');

    // 3-Dot Toggle
    if (triggerBtn && menuSheet) {
      triggerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuSheet.style.display = (menuSheet.style.display === 'flex') ? 'none' : 'flex';
      });

      document.addEventListener('click', function() {
        if (menuSheet) menuSheet.style.display = 'none';
      });
    }

    // 1. Profile action (Drawer trigger)
    document.getElementById('item-profile')?.addEventListener('click', function() {
      const existingDrawerTrigger = document.querySelector('.top-user-group') || document.querySelector('.profile-avatar');
      if (typeof openProfileDrawer === 'function') {
        openProfileDrawer();
      } else if (existingDrawerTrigger) {
        existingDrawerTrigger.click();
      }
    });

    // 2. Setting action (Phase 3 se link hoga)
    document.getElementById('item-setting')?.addEventListener('click', function() {
      const settingPage = document.getElementById('phase3-settings-page');
      if (settingPage) {
        settingPage.style.display = 'flex';
      } else {
        alert("Opening Settings...");
      }
    });

    // 3. Talk Time action
    document.getElementById('item-talktime')?.addEventListener('click', function() {
      // Sync real quotas if available
      const voiceQuota = localStorage.getItem('meher_voice_quota') || '5';
      const photoQuota = localStorage.getItem('meher_photo_quota') || '3';
      const valVoice = document.getElementById('val-voice-quota');
      const valPhoto = document.getElementById('val-photo-quota');
      if (valVoice) valVoice.innerText = `${voiceQuota} / 5 Left`;
      if (valPhoto) valPhoto.innerText = `${photoQuota} / 3 Left`;

      modalTalkTime.style.display = 'flex';
    });
    document.getElementById('close-talktime-btn')?.addEventListener('click', () => modalTalkTime.style.display = 'none');

    // 4. Report action
    document.getElementById('item-report')?.addEventListener('click', function() {
      modalReport.style.display = 'flex';
    });
    document.getElementById('cancel-report-btn')?.addEventListener('click', () => modalReport.style.display = 'none');
    document.getElementById('submit-report-btn')?.addEventListener('click', function() {
      modalReport.style.display = 'none';
      setTimeout(() => {
        alert("Thank you. We take safety seriously and our moderation team will review this interaction.");
      }, 200);
    });

    // 5. Clear chat action
    document.getElementById('item-clear-chat')?.addEventListener('click', function() {
      modalClear.style.display = 'flex';
    });
    document.getElementById('cancel-clear-btn')?.addEventListener('click', () => modalClear.style.display = 'none');
    document.getElementById('confirm-clear-btn')?.addEventListener('click', function() {
      modalClear.style.display = 'none';
      const msgArea = document.getElementById('chat-messages');
      if (msgArea) msgArea.innerHTML = '';
      localStorage.removeItem('meher_chat_history');
      location.reload();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
  } else {
    initModals();
  }
})();
    // =======================================================
// PHASE 3: SETTINGS & USER PROFILE LOGIC CONTROLLER
// =======================================================
(function initPhase3System() {
  // Global User State Memory
  const USER_STORE = {
    getName: () => localStorage.getItem('meher_user_name') || '',
    setName: (val) => localStorage.setItem('meher_user_name', val.trim()),
    getPhone: () => localStorage.getItem('meher_user_phone') || '+91 98765 43210',
    getAvatar: () => localStorage.getItem('meher_user_avatar') || 'assets/default_avatar.png',
    setAvatar: (val) => localStorage.setItem('meher_user_avatar', val),
    getLang: () => localStorage.getItem('meher_user_lang') || 'Hinglish'
  };

  // Strictly filter out "Bhai", "Bro" from calling behavior
  window.getMeherAddressUser = function() {
    const customName = USER_STORE.getName();
    if (customName) return customName;
    return 'yaar'; // Natural default, zero "bhai"
  };

  function renderPhase3Views() {
    const viewsHtml = `
      <!-- SETTINGS MAIN PAGE -->
      <div class="full-screen-view" id="phase3-settings-page">
        <div class="view-header-bar">
          <button class="view-back-btn" id="btn-close-settings">←</button>
          <span class="view-title-text">Settings</span>
          <div style="width: 24px;"></div>
        </div>

        <div class="view-content-body">
          <!-- User Identity Bubble Pill -->
          <div class="user-identity-pill" id="trigger-user-profile">
            <div class="user-pill-left">
              <img src="${USER_STORE.getAvatar()}" id="pill-user-img" class="user-thumb-avatar" alt="User">
              <div class="user-pill-details">
                <span class="user-pill-name" id="pill-user-name">${USER_STORE.getName() || 'Set your name'}</span>
                <span class="user-pill-phone">${USER_STORE.getPhone()}</span>
              </div>
            </div>
            <span class="user-pill-edit-icon">✎</span>
          </div>

          <!-- Dual Grid Cards -->
          <div class="dual-card-grid">
            <div class="feature-dash-card" id="card-talktime-open">
              <div>
                <div class="dash-card-title">Talk Time</div>
                <div class="dash-card-desc">Remaining audio notes & photo quota.</div>
              </div>
              <span class="dash-card-badge badge-green">5 Voice Left</span>
            </div>
            <div class="feature-dash-card" id="card-premium-open">
              <div>
                <div class="dash-card-title">Premium Access</div>
                <div class="dash-card-desc">Priority audio calling & zero limits.</div>
              </div>
              <span class="dash-card-badge badge-purple">Active Tier</span>
            </div>
          </div>

          <!-- Toggles & Lists -->
          <div class="settings-menu-group">
            <div class="settings-row-item">
              <span>Notifications</span>
              <label class="switch-toggle">
                <input type="checkbox" id="toggle-notif" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-row-item" id="btn-open-lang">
              <span>Language</span>
              <span style="color:#8e949a;" id="display-selected-lang">${USER_STORE.getLang()} ›</span>
            </div>
            <div class="settings-row-item" id="btn-share-app">
              <span>Share Meher</span>
              <span style="color:#8e949a;">🔗 ›</span>
            </div>
          </div>

          <!-- About Meher Description -->
          <div class="about-meher-box">
            <strong style="color:#e4e6eb; display:block; margin-bottom:4px;">About Meher</strong>
            Meher is your 20-year-old DU North Campus companion. A mix of dry wit, late-night chai thoughts, candid voice notes, and genuine Delhi college life. No corporate script—just unfiltered conversations.
          </div>

          <!-- Danger Action -->
          <button class="btn-delete-account" id="btn-delete-acc">Delete Account / Reset Data</button>
        </div>
      </div>

      <!-- USER PROFILE SUB-PAGE -->
      <div class="full-screen-view" id="phase3-profile-page">
        <div class="view-header-bar">
          <button class="view-back-btn" id="btn-close-profile">←</button>
          <span class="view-title-text">Profile</span>
          <div style="width: 24px;"></div>
        </div>

        <div class="view-content-body">
          <div class="profile-hero-center">
            <div class="user-large-avatar-box" id="avatar-picker-trigger">
              <img src="${USER_STORE.getAvatar()}" id="profile-large-img" alt="Profile">
              <div class="camera-floating-badge">📷</div>
            </div>
            <input type="file" id="user-file-input" accept="image/*" style="display:none;">
          </div>

          <div class="profile-input-group">
            <label class="profile-field-label">YOUR NAME</label>
            <div class="profile-name-bar">
              <input type="text" class="profile-name-input" id="input-user-name" placeholder="What should Meher call you?" value="${USER_STORE.getName()}">
              <button class="btn-save-name" id="btn-save-username">Save</button>
            </div>
            <div class="profile-helper-note">
              Meher will naturally call you by this name. If empty, she'll use natural pronouns ("tu", "teri", "tumhe", "yaar").
            </div>
          </div>

          <div class="profile-input-group" style="margin-top: 14px;">
            <label class="profile-field-label">REGISTERED NUMBER</label>
            <div class="profile-name-bar" style="background:#121519;">
              <input type="text" class="profile-name-input" value="${USER_STORE.getPhone()}" disabled style="color:#727a82;">
              <span style="font-size:11px; color:#00a884; font-weight:600;">Verified</span>
            </div>
            <div class="profile-helper-note">One verified number per account prevents spam and protects session limits.</div>
          </div>
        </div>
      </div>

      <!-- LANGUAGE PICKER MODAL -->
      <div class="phase2-modal-backdrop" id="modal-lang-backdrop">
        <div class="phase2-dialog-card" style="max-height: 400px; display:flex; flex-direction:column;">
          <div class="dialog-header-title">Select Language</div>
          <div style="overflow-y:auto; display:flex; flex-direction:column; gap:4px; margin-bottom:12px;" id="lang-list-container">
            ${['Hinglish (Default)', 'Hindi', 'English', 'Punjabi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam'].map(l => `
              <button class="lang-item-btn ${USER_STORE.getLang() === l ? 'selected' : ''}" data-lang="${l}">
                <span>${l}</span>${USER_STORE.getLang() === l ? '✓' : ''}
              </button>
            `).join('')}
          </div>
          <button class="dialog-action-btn dialog-btn-cancel" id="btn-close-lang">Done</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', viewsHtml);
    bindPhase3Events();
  }

  function bindPhase3Events() {
    const pageSettings = document.getElementById('phase3-settings-page');
    const pageProfile = document.getElementById('phase3-profile-page');
    const modalLang = document.getElementById('modal-lang-backdrop');

    // 1. Open/Close Settings
    document.getElementById('btn-close-settings')?.addEventListener('click', () => pageSettings.style.display = 'none');
    document.getElementById('item-setting')?.addEventListener('click', () => {
      document.getElementById('phase2-dropdown-menu').style.display = 'none';
      pageSettings.style.display = 'flex';
    });

    // 2. Open/Close Profile Sub-page
    document.getElementById('trigger-user-profile')?.addEventListener('click', () => {
      pageProfile.style.display = 'flex';
    });
    document.getElementById('btn-close-profile')?.addEventListener('click', () => {
      pageProfile.style.display = 'none';
    });

    // 3. Save User Name & Sync Everywhere
    document.getElementById('btn-save-username')?.addEventListener('click', () => {
      const nameInput = document.getElementById('input-user-name');
      if (nameInput) {
        USER_STORE.setName(nameInput.value);
        document.getElementById('pill-user-name').innerText = nameInput.value || 'Set your name';
        alert(`Saved! Meher will now address you as ${nameInput.value || 'yaar'}.`);
      }
    });

    // 4. Avatar Upload & Storage
    const fileInput = document.getElementById('user-file-input');
    document.getElementById('avatar-picker-trigger')?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64 = e.target.result;
          USER_STORE.setAvatar(base64);
          document.getElementById('profile-large-img').src = base64;
          document.getElementById('pill-user-img').src = base64;
        };
        reader.readAsDataURL(file);
      }
    });

    // 5. Language Modal
    document.getElementById('btn-open-lang')?.addEventListener('click', () => modalLang.style.display = 'flex');
    document.getElementById('btn-close-lang')?.addEventListener('click', () => modalLang.style.display = 'none');
    document.querySelectorAll('.lang-item-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const selected = this.getAttribute('data-lang');
        localStorage.setItem('meher_user_lang', selected);
        document.getElementById('display-selected-lang').innerText = selected + ' ›';
        modalLang.style.display = 'none';
      });
    });

    // 6. Share Meher (Native Web Share)
    document.getElementById('btn-share-app')?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Chat with Meher',
            text: 'Meet Meher - 20-year-old DU North Campus student.',
            url: window.location.href
          });
        } catch (e) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('App link copied to clipboard! Share it on WhatsApp or Instagram.');
      }
    });

    // 7. Danger Action: Delete Account / Reset Data
    document.getElementById('btn-delete-acc')?.addEventListener('click', () => {
      if (confirm('Delete all account details, chat memory, and profile data permanently?')) {
        localStorage.clear();
        location.reload();
      }
    });

    // Dual card triggers
    document.getElementById('card-talktime-open')?.addEventListener('click', () => {
      pageSettings.style.display = 'none';
      document.getElementById('item-talktime')?.click();
    });
    document.getElementById('card-premium-open')?.addEventListener('click', () => {
      alert('You are currently on the Unlimited Pro Explorer Access.');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderPhase3Views);
  } else {
    renderPhase3Views();
  }
})();
             // =======================================================
// MEHER DYNAMIC SPLASH CONTROLLER
// =======================================================
(function launchDynamicSplash() {
  function createSplash() {
    const splashMarkup = `
      <div id="meher-dynamic-splash">
        <div class="splash-avatar-wrapper">
          <div class="splash-ring-glow"></div>
          <img src="assets/meher_dp.png" class="splash-avatar-img" alt="Meher">
        </div>
        <div class="splash-brand-title">
          <span>Meher</span>
          <svg class="splash-verified-tick" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <div class="splash-campus-tag">North Campus • DU</div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', splashMarkup);

    const splashEl = document.getElementById('meher-dynamic-splash');

    // 1.6s display time, then seamless dissolvation
    setTimeout(() => {
      if (splashEl) {
        splashEl.classList.add('splash-exit-active');
        setTimeout(() => splashEl.remove(), 550);
      }
    }, 1600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSplash);
  } else {
    createSplash();
  }
})();
// =======================================================
// MEHER LIVE VOICE ENGINE (AISHA MODEL ID)
// =======================================================
const MEHER_VOICE_CONFIG = {
  voiceId: "M7GHBtY0UEqljrKQw2JH", // Aisha Voice ID
  modelId: "eleven_multilingual_v2",
  voiceSettings: {
    stability: 0.40,
    similarity_boost: 0.85,
    style: 0.0,
    use_speaker_boost: true
  },
  
  cleanPhonetics: function(rawText) {
    if (!rawText) return "";
    return rawText
      .replace(/\bchai\b/gi, "chaai")
      .replace(/\broom par\b/gi, "room pe")
      .replace(/\.\.\./g, ", ")
      .replace(/[\(\)\[\]\*_]/g, "")
      .trim();
  }
};
// Logout Handler
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  if (confirm("Kya aap Meher se logout karna chahte hain?")) {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }
});
// Logout Click Handler
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  if (confirm("Logout karna chahte hain?")) {
    await auth.signOut();
    window.location.reload();
  }
});
// ==========================================
// iOS Audio Friction Unlocker & PWA Support
// ==========================================

let audioContextInstance = null;

function initIOSAudioEngine() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !audioContextInstance) {
      audioContextInstance = new AudioContext();
      
      const buffer = audioContextInstance.createBuffer(1, 1, 22050);
      const source = audioContextInstance.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextInstance.destination);
      source.start(0);

      if (audioContextInstance.state === "suspended") {
        audioContextInstance.resume();
      }
    }
  } catch (e) {
    console.warn("Audio Context Init Fallback:", e);
  }
}

["touchstart", "click", "keydown"].forEach((evt) => {
  window.addEventListener(evt, initIOSAudioEngine, { once: true });
});

function notifyIOSMuteState() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS && !sessionStorage.getItem("ios_mute_tip_shown")) {
    const tip = document.createElement("div");
    tip.style.cssText = `
      position: fixed;
      top: 65px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(31, 44, 52, 0.95);
      color: #ffd279;
      border: 1px solid #ffd279;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 11px;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: fadeInOut 4s forwards;
    `;
    tip.textContent = "🔊 Awaz na aaye toh iPhone ka side silent switch check karein";
    document.body.appendChild(tip);
    sessionStorage.setItem("ios_mute_tip_shown", "true");

    setTimeout(() => tip.remove(), 4000);
  }
}

window.notifyIOSMuteState = notifyIOSMuteState;
// 2. iOS PWA / Add-to-Home Guide Prompt
function checkAndShowIOSPrompt() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

  // Sirf tab dikhana jab iOS ho aur pehle se install na ho
  if (isIOS && !isStandalone && !sessionStorage.getItem("ios_pwa_prompt_dismissed")) {
    const iosBanner = document.createElement("div");
    iosBanner.id = "ios-install-banner";
    iosBanner.style.cssText = `
      position: fixed;
      bottom: 70px;
      left: 12px;
      right: 12px;
      background: #1f2c34;
      color: #e9edef;
      border: 1px solid #00a884;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 13px;
      z-index: 9999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 1.4;
    `;

    iosBanner.innerHTML = `
      <div>
        <strong>Real WhatsApp feel & alerts:</strong><br>
        Tap <span style="font-size: 15px;">⎋</span> (Share) aur chunein <strong>'Add to Home Screen'</strong>.
      </div>
      <button id="close-ios-banner" style="background: transparent; border: none; color: #8696a0; font-size: 18px; cursor: pointer; padding: 4px 8px;">✕</button>
    `;

    document.body.appendChild(iosBanner);

    document.getElementById("close-ios-banner").addEventListener("click", () => {
      iosBanner.remove();
      sessionStorage.setItem("ios_pwa_prompt_dismissed", "true");
    });
  }
}

// Window load hone par check karein
window.addEventListener("DOMContentLoaded", checkAndShowIOSPrompt);
// ==========================================
// New Chat & Session Archive Logic
// ==========================================

const newChatBtn = document.getElementById("new-chat-btn");

if (newChatBtn) {
  newChatBtn.addEventListener("click", async () => {
    const confirmReset = confirm("Nayi chat shuru karni hai? Purani chat archive ho jayegi.");
    if (!confirmReset) return;

    try {
      const currentUser = firebase.auth().currentUser;
      
      // 1. Purani chat Firestore ke archives folder me save karna
      if (currentUser && conversationHistory.length > 0) {
        await db.collection("users").doc(currentUser.uid).collection("archives").add({
          messages: conversationHistory,
          archivedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Current active messages clear karna
        await db.collection("users").doc(currentUser.uid).collection("messages").get().then((snapshot) => {
          snapshot.forEach((doc) => doc.ref.delete());
        });
      }

      // 2. Local memory clean karna (lekin permanent facts bacha kar rakhna)
      conversationHistory = [];
      localStorage.removeItem("meher_chat_history");

      // 3. Chat window visual clear karna
      const chatMessages = document.getElementById("chat-messages") || document.querySelector(".chat-messages");
      if (chatMessages) {
        chatMessages.innerHTML = "";
      }

      // 4. Meher ka fresh conversation starter
      if (typeof appendMessage === "function") {
        appendMessage("assistant", "Hey! Nayi shuruwat? Batao, kya chal raha hai?");
      }

    } catch (err) {
      console.error("Archive Error:", err);
      alert("Chat reset karne me glitch aaya, page reload karein.");
    }
  });
                                                                     }
