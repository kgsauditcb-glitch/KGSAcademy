import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

function isAllowedOrigin(origin: string | null): boolean {
  // Allow browser requests from your Vercel frontend
  if (origin) {
    return (
      origin === "https://kgs-audit-pro-client.vercel.app" ||
      origin.endsWith(".vercel.app")
    );
  }
  
  // Allow server-to-server calls (e.g. Next.js backend / Server Actions with null origin)
  return true;
}

function getCorsHeaders(origin: string | null) {
  const allowed = origin && isAllowedOrigin(origin) ? origin : "https://kgs-audit-pro-client.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!isAllowedOrigin(origin)) {
    console.warn(JSON.stringify({ event: "blocked_unauthorized_origin", origin, timestamp: new Date().toISOString() }));
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let payload: EmailPayload | undefined;

  try {
    payload = await req.json();

    if (!payload?.to || !payload?.subject || (!payload?.html && !payload?.text)) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, and html or text",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Pull SMTP config from environment secrets
    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "465");
    const SMTP_SECURE = (Deno.env.get("SMTP_SECURE") ?? "true") === "true";
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");
    const FROM_EMAIL = Deno.env.get("SMTP_FROM") ?? SMTP_USER;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return new Response(
        JSON.stringify({ error: "SMTP server configuration is incomplete" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: SMTP_SECURE,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    });

    const finalFrom = payload.from ?? FROM_EMAIL;

    await client.send({
      from: finalFrom,
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      content: payload.text ?? "Please view this email in an HTML-compatible client.",
      html: payload.html,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});