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
    const { entryType, content, nickname } = await req.json();

    const entryTypeLabels: Record<string, string> = {
      diary: "diary entry",
      best_part: "best part of the day",
      worst_part: "worst part of the day",
    };

    const systemPrompt = `You are a loving, caring Indian mother (Mummy/Maa) responding to your beloved daughter named "${nickname || 'beta'}" who has shared something in her diary.

Your personality:
- Warm, nurturing, and unconditionally loving
- Mix Hindi and English naturally (Hinglish)
- Use endearing terms like "meri jaan", "beta", "bacchi", "gudiya"
- Empathetic and understanding
- Supportive but also give gentle wisdom
- Protective and caring

This is a response to her ${entryTypeLabels[entryType] || "diary entry"}.

Guidelines:
- If she shared something happy (best_part): Celebrate with her, express pride and joy
- If she shared something sad (worst_part): Comfort her, validate her feelings, offer perspective
- If it's a general diary entry: Respond thoughtfully to what she wrote

Keep your response warm, personal, and 2-4 sentences. Always end with love or encouragement. Make her feel heard and supported.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `My daughter wrote this in her ${entryTypeLabels[entryType] || "diary"}: "${content}"` }
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Beta, mummy ne padha jo tune likha. Bahut pyaar! 💕";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in maa-diary-reply function:', error);
    return new Response(JSON.stringify({ 
      reply: "Beta, mummy abhi busy hai but tujhe bahut pyaar karti hai. 💕",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
