// Calling Handlers
const startCallBtn = document.getElementById('startCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callStatusTimer = document.getElementById('callStatusTimer');
const balanceMinsDisplay = document.getElementById('balanceMinsDisplay');
const voiceMsgBtn = document.getElementById('voiceMsgBtn');
const playVoiceIntroBtn = document.getElementById('playVoiceIntroBtn');

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
  callOverlay.classList.remove('active');
}

startCallBtn.addEventListener('click', startCall);
endCallBtn.addEventListener('click', endCall);
// Talktime Recharge
const packageCards = document.querySelectorAll('.package-card');
packageCards.forEach(card => {
  card.addEventListener('click', () => {
    const addedMins = parseInt(card.getAttribute('data-mins'), 10);
    state.callMinutes += addedMins;
    updateBalanceUI();
    alert(`Success! ${addedMins} minutes added to your account.`);
    hideScreen(talkTimeScreen);
  });
});

// Voice Intro Button (Direct Audio Link)
const playVoiceIntroBtn = document.getElementById('playVoiceIntroBtn');
const meherAudio = new Audio('https://actions.google.com/sounds/v1/human_voices/female_voice_intro.ogg'); // Fallback demo voice

let isAudioRunning = false;

if (playVoiceIntroBtn) {
  playVoiceIntroBtn.addEventListener('click', () => {
    // Agar pehle se chal raha ho toh pause karein
    if (isAudioRunning) {
      meherAudio.pause();
      meherAudio.currentTime = 0;
      isAudioRunning = false;
      playVoiceIntroBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Play Voice Intro (0:12)';
      return;
    }

    // Play Voice
    playVoiceIntroBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Playing...';
    
    meherAudio.play()
      .then(() => {
        isAudioRunning = true;
        playVoiceIntroBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Playing Voice Intro...';
      })
      .catch((err) => {
        console.error("Audio playback error:", err);
        // Fallback speech alert
        alert("Audio play karne ke liye screen par ek baar tap karke dobara dabayein.");
        playVoiceIntroBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Play Voice Intro (0:12)';
        isAudioRunning = false;
      });

    meherAudio.onended = () => {
      isAudioRunning = false;
      playVoiceIntroBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Play Voice Intro (0:12)';
    };
  });
}

// Voice Note Mic Button
voiceMsgBtn.addEventListener('click', () => {
  appendMessage("🎤 [Voice Note: 0:04]", 'user');
  triggerMeherReply("sent a voice note");
});

