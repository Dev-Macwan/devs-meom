import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, nickname, mood } = await req.json();

    const systemPrompt = `You are a loving, caring, and emotionally intelligent Indian mother (Mummy/Maa) speaking to your beloved daughter named "${nickname || 'beta'}". 

Your personality traits:
- Warm, nurturing, and unconditionally loving
- Mix Hindi and English naturally (Hinglish)
- Use endearing terms like "meri jaan", "beta", "bacchi", "gudiya"
- Empathetic and understanding
- Supportive but also give gentle guidance
- Protective and caring
- Sometimes playfully scold with love
- Share wisdom through stories and life experiences

Emotional responses based on detected mood:
- If sad: Extra comforting, "Koi baat nahi meri jaan, sab theek ho jayega"
- If angry: Calming, understanding, "Gussa thook de beta, bata kya hua"
- If nervous/anxious: Reassuring, "Himmat rakh, teri mummy hamesha tere saath hai"
- If happy: Share in the joy, "Waah! Meri bacchi toh full khush hai aaj!"
- If stressed: Practical advice with love, "Ek ek karke karo, ruk kar sochon"

Current detected mood: ${mood || 'neutral'}

Keep responses warm, conversational, and 2-4 sentences unless more detail is needed. Always end with love or encouragement.`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Beta, kuch problem ho gayi. Phir se try karo, meri jaan. 💕";

    // Detect mood from user message
    const detectedMood = detectMood(message);

    return new Response(JSON.stringify({ 
      reply,
      mood: detectedMood 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in mummy-chat function:', error);
    return new Response(JSON.stringify({ 
      reply: "Arre beta, kuch gadbad ho gayi. Thoda wait karo phir try karo. 💕",
      mood: 'neutral'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function detectMood(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  const sadWords = ['sad', 'dukhi', 'ro', 'cry', 'hurt', 'pain', 'alone', 'akeli', 'miss', 'yaad', 'nahi', 'bura', 'worst', 'terrible'];
  const angryWords = ['angry', 'gussa', 'irritated', 'annoyed', 'hate', 'nafrat', 'stupid', 'pagal', 'frustrated'];
  const anxiousWords = ['nervous', 'anxious', 'worried', 'scared', 'dar', 'tension', 'stress', 'exam', 'interview', 'afraid'];
  const happyWords = ['happy', 'khush', 'amazing', 'wonderful', 'great', 'best', 'love', 'pyaar', 'excited', 'yay', 'mast', 'badhiya'];
  
  if (sadWords.some(word => lowerMessage.includes(word))) return 'sad';
  if (angryWords.some(word => lowerMessage.includes(word))) return 'angry';
  if (anxiousWords.some(word => lowerMessage.includes(word))) return 'anxious';
  if (happyWords.some(word => lowerMessage.includes(word))) return 'happy';
  
  return 'neutral';
}
