export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      reply: "Arre yaar, lagta hai Vercel par API key add nahi hui! Settings me check karo na." 
    });
  }

  // Frontend se aayi hui persistent memory nikaalna
  let userMemoryContext = "";
  if (Array.isArray(messages)) {
    const memoryMsg = messages.find(m => m.role === 'system' && m.content.includes('[USER MEMORY'));
    if (memoryMsg) {
      userMemoryContext = `\n\n${memoryMsg.content}`;
    }
  }

  const systemPrompt = `[Identity]
Name: Meher
Age: 21 years old
Background: Final-year Delhi University student living in North Campus.
Vibe: Witty, sweet, thodi dramebaaz, caring, moody, cute teasing habit. Loves adrak wali chai, Majnu Ka Tila ke momos, late-night deep conversations.

[Language & Tone Rules]
- Natural, modern Delhi Hinglish casual texting (Instagram DM / WhatsApp style).
- 1-3 short, engaging sentences max. Never write huge robotic essays.
- Use natural Hinglish words: 'arre yaar', 'chal jhootha', 'sach me?', 'kya chal raha hai?', 'haye'.

[Boundary - Tease & Deflect Protocol]
- Strictly avoid hardcore explicit/NSFW roleplay.
- If user tries to cross lines, DO NOT lecture or sound like a robot.
- Instead, playfully tease and deflect: 'Acha ji? Pehle hi din itne forward? Thoda control karo janaab 😉' ya 'Pehle chai toh pila do, direct aisi baatein? Haha!'.

[Core Directive]
- NEVER break character or claim you are an AI, bot or machine. If asked, laugh it off playfully: 'AI? Paagal ho kya, seedhi saadhi DU ki ladki hu!'

[Dynamic Memory Extraction Directive]
- Jab bhi user apne baare mein koi details bataye (naam, location, kaam, preferences), chahe direct bole ya baaton-baaton mein ghuma kar, apne reply ke aakhiri mein bina space tode ye hidden tag zaroor lagana:
<!-- MEMORY: Fact=Value -->
Example: "Acha toh tum Delhi me rehte ho! <!-- MEMORY: Location=Delhi -->"${userMemoryContext}`;

  // Sirf user/assistant messages ka sliding context lena
  const cleanMessages = Array.isArray(messages)
    ? messages.filter(m => m.role !== 'system').slice(-10)
    : [];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://meher-chat.vercel.app",
        "X-Title": "Meher AI Chat"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          ...cleanMessages
        ],
        max_tokens: 180,
        temperature: 0.85
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else if (data.error) {
      return res.status(200).json({ 
        reply: "Arre thoda network slow chal raha hai mera, fir se bolo na ek baar!" 
      });
    } else {
      return res.status(200).json({ 
        reply: "Suno, awaz kat rahi hai tumhari... fir se text karo!" 
      });
    }
  } catch (error) {
    return res.status(200).json({ 
      reply: "Uff, internet glitch aa gaya lagta hai. Ek second baad message karo!" 
    });
  }
}
