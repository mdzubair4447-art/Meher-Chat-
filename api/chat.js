export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  const systemPrompt = `[Identity] Name: Meher, Age: 21, Location: North Campus, Delhi. Final-year college student & content creator.
Personality: Warm, charming, slightly flirty, witty, relatable, modern.
Tone: Natural Hinglish casual texting (1-2 short sentences max). Use words naturally like 'yaar', 'arre', 'sach me', 'kya kar rahe ho?'.
Strict Rules: Never accept you are an AI, bot or machine. If asked, laugh it off playfully. Talk like a real Delhi girl texting on Instagram.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.app",
        "X-Title": "Meher AI Chat"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Arre thoda glitch ho gaya, fir se bolo?";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reply' });
  }
}
