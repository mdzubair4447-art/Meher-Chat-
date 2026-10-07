// Chat DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Profile DM Button
document.getElementById('profileDmBtn').addEventListener('click', () => {
  hideScreen(profileScreen);
  messageInput.focus();
});

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

function setTyping(isTyping) {
  if (isTyping) {
    typingIndicator.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    typingIndicator.style.display = 'none';
  }
}
// Meher Persona & Context
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

// Clear Chat Logic
function clearAllMessages() {
  if (confirm("Kya aap saari chat delete karna chahte hain?")) {
    chatContainer.innerHTML = '';
    conversationHistory.length = 1;
    dropdownMenu.classList.remove('active');
    hideScreen(settingsScreen);
  }
}
document.getElementById('menuClearChat').addEventListener('click', clearAllMessages);
document.getElementById('rowClearHistory').addEventListener('click', clearAllMessages);

