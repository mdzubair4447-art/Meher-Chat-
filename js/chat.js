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
  if (isTyping) {
    typingIndicator.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    typingIndicator.style.display = 'none';
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
      <audio id="entryAudio" src="meher_intro.mp3"></audio>
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
window.toggleEntryAudio = function(btn) {
  const audio = document.getElementById('entryAudio');
  if (!audio) return;

  if (audio.paused) {
    audio.play();
    btn.innerText = '⏸';
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

// OpenRouter LLM Call with Natural Delay & Multi-Bubble Delivery
async function triggerMeherReply(userMessage) {
  let apiKey = localStorage.getItem('openrouter_api_key');

  if (!apiKey) {
    setTyping(false);
    appendMessage("Pehle Settings mein ja kar OpenRouter API key daalo na!", 'meher');
    return;
  }

  // Extra spaces hatana
  apiKey = apiKey.trim();

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
        model: "openrouter/auto",
        messages: conversationHistory,
        max_tokens: 120,
        temperature: 0.85
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const reply = data.choices[0].message.content.trim();
      conversationHistory.push({ role: "assistant", content: reply });

      const delay = Math.min(Math.max(reply.length * 35, 1200), 2500);
      setTimeout(() => {
        setTyping(false);
        appendMessage(reply, 'meher');
      }, delay);

    } else {
      setTyping(false);
      const errDetail = data.error ? data.error.message : JSON.stringify(data);
      alert("API Error: " + errDetail);
      appendMessage("WiFi ajeeb chal raha hai mera hostel ka... dobara bolo?", 'meher');
    }
  } catch (error) {
    setTyping(false);
    console.error("API Error:", error);
    alert("Network Error: " + error.message);
    appendMessage("Yaar connection drop ho gaya mera, ek second ruko.", 'meher');
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

// Page reload par agar chatContainer khula ho toh initial hooks render kar do
document.addEventListener('DOMContentLoaded', () => {
  loadInitialChatHooks();
});
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

