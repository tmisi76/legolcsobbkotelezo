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

interface ValidationError {
  field: string;
  message: string;
}

const validateInput = (data: unknown): { valid: true; data: SavingsRequest } | { valid: false; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Invalid request body' }] };
  }

  const input = data as Record<string, unknown>;
  
  // Validate brand
  if (typeof input.brand !== 'string' || input.brand.trim().length === 0) {
    errors.push({ field: 'brand', message: 'Brand is required and must be a non-empty string' });
  } else if (input.brand.length > 100) {
    errors.push({ field: 'brand', message: 'Brand must be less than 100 characters' });
  }

  // Validate model
  if (typeof input.model !== 'string' || input.model.trim().length === 0) {
    errors.push({ field: 'model', message: 'Model is required and must be a non-empty string' });
  } else if (input.model.length > 100) {
    errors.push({ field: 'model', message: 'Model must be less than 100 characters' });
  }

  // Validate year
  const currentYear = new Date().getFullYear();
  if (typeof input.year !== 'number' || !Number.isInteger(input.year)) {
    errors.push({ field: 'year', message: 'Year must be an integer' });
  } else if (input.year < 1970 || input.year > currentYear + 1) {
    errors.push({ field: 'year', message: `Year must be between 1970 and ${currentYear + 1}` });
  }

  // Validate enginePowerKw (optional, can be null)
  if (input.enginePowerKw !== null && input.enginePowerKw !== undefined) {
    if (typeof input.enginePowerKw !== 'number' || !Number.isInteger(input.enginePowerKw)) {
      errors.push({ field: 'enginePowerKw', message: 'Engine power must be an integer or null' });
    } else if (input.enginePowerKw < 1 || input.enginePowerKw > 1000) {
      errors.push({ field: 'enginePowerKw', message: 'Engine power must be between 1 and 1000 kW' });
    }
  }

  // Validate currentAnnualFee
  if (typeof input.currentAnnualFee !== 'number' || !Number.isInteger(input.currentAnnualFee)) {
    errors.push({ field: 'currentAnnualFee', message: 'Current annual fee must be an integer' });
  } else if (input.currentAnnualFee < 1000 || input.currentAnnualFee > 10000000) {
    errors.push({ field: 'currentAnnualFee', message: 'Current annual fee must be between 1,000 and 10,000,000 HUF' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      brand: (input.brand as string).trim(),
      model: (input.model as string).trim(),
      year: input.year as number,
      enginePowerKw: input.enginePowerKw as number | null,
      currentAnnualFee: input.currentAnnualFee as number,
    }
  };
};

// Sanitize string for prompt to prevent injection
const sanitizeForPrompt = (str: string): string => {
  return str.replace(/[<>{}[\]\\]/g, '').substring(0, 100);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[estimate-savings] API key not configured");
      throw new Error("Service configuration error");
    }

    // Parse and validate input
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ errorCode: 'INVALID_JSON', message: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateInput(requestBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ errorCode: 'INVALID_INPUT', errors: validation.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { brand, model, year, enginePowerKw, currentAnnualFee } = validation.data;

    // Sanitize strings before using in prompt
    const safeBrand = sanitizeForPrompt(brand);
    const safeModel = sanitizeForPrompt(model);

    console.log(`Estimating savings for ${safeBrand} ${safeModel} ${year}`);

    const prompt = `Based on Hungarian car insurance market data and trends, estimate potential annual savings for switching car insurance.

Car details:
- Brand: ${safeBrand}
- Model: ${safeModel}
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
          JSON.stringify({ errorCode: 'RATE_LIMIT' }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ errorCode: 'SERVICE_UNAVAILABLE' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("[estimate-savings] AI gateway error:", response.status);
      throw new Error("Service temporarily unavailable");
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "estimate_savings") {
      // Fallback to simple calculation
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
  } catch (error: unknown) {
    console.error("[estimate-savings] Function error:", error);
    return new Response(
      JSON.stringify({ errorCode: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
