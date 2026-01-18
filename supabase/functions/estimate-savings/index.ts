import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SavingsRequest {
  brand: string;
  model: string;
  year: number;
  enginePowerKw: number | null;
  currentAnnualFee: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { brand, model, year, enginePowerKw, currentAnnualFee }: SavingsRequest = await req.json();

    console.log(`Estimating savings for ${brand} ${model} ${year}`);

    const prompt = `Based on Hungarian car insurance market data and trends, estimate potential annual savings for switching car insurance.

Car details:
- Brand: ${brand}
- Model: ${model}
- Year: ${year}
- Engine power: ${enginePowerKw ? `${enginePowerKw} kW` : 'Unknown'}
- Current annual fee: ${currentAnnualFee.toLocaleString('hu-HU')} HUF

Consider:
1. Typical insurance price variations between providers in Hungary
2. The car's age and how it affects premiums
3. Common discounts for switching (new customer promotions)
4. Market competition dynamics

Provide a realistic savings estimate. Typical savings range is 10-25% of current premium.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "You are a Hungarian car insurance expert. Provide accurate, data-driven estimates. Be concise and helpful." 
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "estimate_savings",
              description: "Return savings estimate with details",
              parameters: {
                type: "object",
                properties: {
                  savingsPercentMin: { 
                    type: "number", 
                    description: "Minimum expected savings percentage (e.g., 10)" 
                  },
                  savingsPercentMax: { 
                    type: "number", 
                    description: "Maximum expected savings percentage (e.g., 20)" 
                  },
                  savingsAmountMin: { 
                    type: "number", 
                    description: "Minimum expected savings in HUF" 
                  },
                  savingsAmountMax: { 
                    type: "number", 
                    description: "Maximum expected savings in HUF" 
                  },
                  confidence: { 
                    type: "string", 
                    enum: ["low", "medium", "high"],
                    description: "Confidence level of the estimate" 
                  },
                  factors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key factors affecting the estimate"
                  }
                },
                required: ["savingsPercentMin", "savingsPercentMax", "savingsAmountMin", "savingsAmountMax", "confidence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "estimate_savings" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "estimate_savings") {
      // Fallback to simple calculation
      const defaultPercent = 15 + Math.random() * 10; // 15-25%
      return new Response(
        JSON.stringify({
          savingsPercentMin: 12,
          savingsPercentMax: 22,
          savingsAmountMin: Math.round(currentAnnualFee * 0.12),
          savingsAmountMax: Math.round(currentAnnualFee * 0.22),
          confidence: "medium",
          factors: ["Market competition", "New customer discounts"]
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const estimate = JSON.parse(toolCall.function.arguments);
    console.log("Parsed estimate:", estimate);

    return new Response(
      JSON.stringify(estimate),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in estimate-savings function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
