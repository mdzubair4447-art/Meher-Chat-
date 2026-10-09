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
  if (chatContainer.children.length > 0) return;

  // (A) First Voice Note Bubble
  const voiceRow = document.createElement('div');
  voiceRow.className = 'msg-row meher';
  voiceRow.innerHTML = `
    <div class="msg-bubble voice-bubble">
      <button class="voice-play-btn" id="entryAudioBtn" onclick="toggleEntryAudio(this)">▶</button>
      <div class="voice-wave-ui">
        <span></span><span></span><span class="tall"></span><span></span><span class="tall"></span><span></span>
      </div>
      <span class="voice-time">0:14</span>
      <audio id="entryAudio" src="meher_intro.mp3"></audio>
      <span class="msg-time">${getCurrentTime()}</span>
    </div>
  `;
  chatContainer.appendChild(voiceRow);

  // (B) Missed Audio Call Bubble
  const callRow = document.createElement('div');
  callRow.className = 'missed-call-banner';
  callRow.innerHTML = `
    <span class="call-icon">📞</span>
    <div class="call-info">
      <strong>Missed audio call</strong>
      <small>12 mins ago</small>
    </div>
  `;
  chatContainer.appendChild(callRow);

  // (C) Blurred Teaser Image Bubble
  const imgRow = document.createElement('div');
  imgRow.className = 'msg-row meher';
  imgRow.innerHTML = `
    <div class="msg-bubble image-bubble protected-bubble">
      <div class="blur-box">
        <img src="img1.jpg.jpeg" alt="Teaser" class="blurred-pic" />
        <div class="blur-lock-text">🔒 Locked candid</div>
      </div>
      <span class="msg-time">${getCurrentTime()}</span>
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
  const apiKey = localStorage.getItem('openrouter_api_key');

  if (!apiKey) {
    setTyping(false);
    appendMessage("Pehle Settings mein ja kar OpenRouter API key daalo na!", 'meher');
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
        max_tokens: 100,
        temperature: 0.85
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content.trim();
      conversationHistory.push({ role: "assistant", content: reply });

      // Realistic typing delay: 1.5s - 2.5s
      const delay = Math.min(Math.max(reply.length * 35, 1500), 2800);
      setTimeout(() => {
        setTyping(false);
        appendMessage(reply, 'meher');
      }, delay);

    } else {
      setTyping(false);
      appendMessage("WiFi ajeeb chal raha hai mera hostel ka... dobara bolo?", 'meher');
    }
  } catch (error) {
    setTyping(false);
    console.error("API Error:", error);
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
  
