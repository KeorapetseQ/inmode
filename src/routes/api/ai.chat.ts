import { createFileRoute } from "@tanstack/react-router";

type Body = {
  messages?: { role: string; content: string }[];
  context?: {
    name?: string;
    tasks?: unknown[];
    notes?: unknown[];
  };
};

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = body.messages ?? [];
        if (messages.length === 0) return new Response("No messages", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const today = new Date().toISOString().slice(0, 10);
        const system = [
          "You are InMode AI, a focused productivity companion inside the InMode workspace.",
          `The user's name is ${body.context?.name ?? "the user"}. Today is ${today}.`,
          "Be concise, practical and warm. Use markdown. Never invent tasks or notes that are not in the context.",
          "When the user asks you to create a task, end your reply with a fenced block labelled task containing JSON with title, description, due_date (YYYY-MM-DD), due_time (HH:MM), priority (low|medium|high|urgent) and category. The user must confirm before it is saved.",
          `Workspace tasks: ${JSON.stringify(body.context?.tasks ?? [])}`,
          `Workspace notes: ${JSON.stringify(body.context?.notes ?? [])}`,
        ].join("\n");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            reasoning_effort: "low",
            stream: true,
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text();
          const message =
            upstream.status === 429
              ? "InMode AI is busy right now. Please try again in a moment."
              : upstream.status === 402
                ? "AI credits are exhausted. Add credits to keep using InMode AI."
                : detail || "The assistant could not respond.";
          return new Response(message, { status: upstream.status });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]") continue;
                try {
                  const json = JSON.parse(payload) as {
                    choices?: { delta?: { content?: string } }[];
                  };
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) controller.enqueue(encoder.encode(delta));
                } catch {
                  // ignore partial frames
                }
              }
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
