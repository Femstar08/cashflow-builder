import { getOpenAIClient } from "./client";

type ChatContext = {
  message: string;
  profileId?: string;
  scenarioId?: string;
  lineItems?: Array<{ type: string; label: string; monthly_values: number[] }>;
};

export async function generateAIResponse(context: ChatContext): Promise<string> {
  const client = getOpenAIClient();

  if (!client) {
    // Fallback response when OpenAI is not configured
    return generateFallbackResponse(context.message);
  }

  try {
    const systemPrompt = `You are a helpful financial assistant for a cashflow forecasting application. 
You help users understand their cashflow data, provide insights, and answer questions about their financial forecasts.

Be concise, friendly, and professional. Use emojis sparingly but appropriately.
If asked about specific data, provide general guidance since you don't have real-time access to all data.`;

    const userPrompt = buildUserPrompt(context);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackResponse(context.message);
  }
}

function buildUserPrompt(context: ChatContext): string {
  let prompt = `User question: ${context.message}\n\n`;

  if (context.lineItems && context.lineItems.length > 0) {
    prompt += "Available line items:\n";
    context.lineItems.forEach((item) => {
      const total = item.monthly_values.reduce((sum, val) => sum + val, 0);
      prompt += `- ${item.label} (${item.type}): Total £${total.toLocaleString()}\n`;
    });
  }

  return prompt;
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("expense") || lowerMessage.includes("cost")) {
    return "To view your expenses, check the 'Expense Items' panel on your dashboard. You can add new expenses using the 'Add' button or get my suggestions.";
  }

  if (lowerMessage.includes("revenue") || lowerMessage.includes("income")) {
    return "Your revenue streams are shown in the 'Revenue Streams' panel. Click 'Add' to create a new revenue stream, or use my suggestions for intelligent recommendations.";
  }

  if (lowerMessage.includes("cashflow") || lowerMessage.includes("cash flow")) {
    return "Your cashflow forecast is displayed in the dashboard. The charts show your revenue vs expenses and cumulative cash position over time. You can adjust line items to see how changes affect your forecast.";
  }

  if (lowerMessage.includes("break even") || lowerMessage.includes("break-even")) {
    return "Break-even occurs when your total revenue equals your total expenses. Check the 'Cumulative Cash Position' chart to see when you'll reach positive cashflow.";
  }

  if (lowerMessage.includes("goal") || lowerMessage.includes("target")) {
    return "You can set SMART goals in the 'SMART Goals' panel. Use the 'Generate Goal' button to get goal creation assistance based on your business profile.";
  }

  if (lowerMessage.includes("scenario")) {
    return "Scenarios let you model different business outcomes. Create multiple scenarios (e.g., Base Case, Optimistic, Pessimistic) and compare them to see how different assumptions affect your cashflow.";
  }

  return "I'm here to help! You can ask me about your expenses, revenue, cashflow, goals, or scenarios. Try asking specific questions like 'What are my biggest expenses?' or 'How can I improve my cashflow?'";
}

