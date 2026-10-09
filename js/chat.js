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
  
