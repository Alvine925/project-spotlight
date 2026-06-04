import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const analyzeInput = z.object({ url: z.string().url() });

type Extracted = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  tech_stack: string[];
  features: string[];
  use_cases: string[];
};

export const analyzeProjectUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => analyzeInput.parse(input))
  .handler(async ({ data, context }): Promise<Extracted & { cover_image_url: string | null; url: string }> => {
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;
    if (!firecrawlKey) throw new Error("Firecrawl is not configured");
    if (!lovableKey) throw new Error("AI gateway is not configured");

    const userId = (context as { userId: string }).userId;

    // 1) Scrape the URL via Firecrawl
    const scrapeRes = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: data.url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    if (!scrapeRes.ok) {
      const text = await scrapeRes.text().catch(() => "");
      throw new Error(`Could not scrape that URL (${scrapeRes.status}). ${text.slice(0, 200)}`);
    }
    const scrapeJson = (await scrapeRes.json()) as {
      data?: { markdown?: string; metadata?: { title?: string; description?: string } };
    };
    const markdown = scrapeJson.data?.markdown ?? "";
    const metaTitle = scrapeJson.data?.metadata?.title ?? "";
    const metaDesc = scrapeJson.data?.metadata?.description ?? "";
    const trimmed = markdown.slice(0, 8000);

    // 2) Ask the AI to structure project metadata
    const extractRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Extract structured product metadata from a website. Return concise, accurate values based ONLY on the provided content. Do not invent features.",
          },
          {
            role: "user",
            content: `URL: ${data.url}\nMETA TITLE: ${metaTitle}\nMETA DESC: ${metaDesc}\n\nCONTENT:\n${trimmed}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_project_metadata",
              description: "Save extracted project metadata",
              parameters: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  tagline: { type: "string" },
                  description: { type: "string" },
                  category: {
                    type: "string",
                    enum: ["Productivity", "AI", "Developer Tools", "Finance", "Marketing", "Other"],
                  },
                  tags: { type: "array", items: { type: "string" } },
                  tech_stack: { type: "array", items: { type: "string" } },
                  features: { type: "array", items: { type: "string" } },
                  use_cases: { type: "array", items: { type: "string" } },
                },
                required: ["name", "tagline", "description", "category", "tags", "tech_stack", "features", "use_cases"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_project_metadata" } },
      }),
    });
    if (!extractRes.ok) {
      const text = await extractRes.text().catch(() => "");
      throw new Error(`AI extraction failed (${extractRes.status}). ${text.slice(0, 200)}`);
    }
    const extractJson = (await extractRes.json()) as {
      choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
    };
    const argsStr = extractJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argsStr) throw new Error("AI did not return structured metadata");
    const parsed = JSON.parse(argsStr) as Extracted;

    // 3) Generate a cover image and upload to storage
    let cover_image_url: string | null = null;
    try {
      const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Modern abstract cover image for a product named "${parsed.name}". Theme: ${parsed.tagline}. Style: minimal, vibrant gradient, soft geometric shapes, no text, 16:9 wide.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });
      if (imgRes.ok) {
        const imgJson = (await imgRes.json()) as { data?: Array<{ b64_json?: string }> };
        const b64 = imgJson.data?.[0]?.b64_json;
        if (b64) {
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const filePath = `${userId}/${Date.now()}.png`;
          const { error: upErr } = await supabaseAdmin.storage
            .from("covers")
            .upload(filePath, bytes, { contentType: "image/png", upsert: true });
          if (!upErr) {
            const { data: pub } = supabaseAdmin.storage.from("covers").getPublicUrl(filePath);
            cover_image_url = pub.publicUrl;
          } else {
            console.error("cover upload failed", upErr);
          }
        }
      } else {
        console.error("image gen failed", imgRes.status, await imgRes.text().catch(() => ""));
      }
    } catch (e) {
      console.error("cover image generation failed", e);
    }

    return { ...parsed, cover_image_url, url: data.url };
  });
