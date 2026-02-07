import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const store = getStore("avalonflow-submissions");

  // Get client IP (Netlify provides this)
  const ip =
    event.headers["x-forwarded-for"]?.split(",")[0] ||
    event.headers["client-ip"] ||
    "unknown";

  // Optional: also accept a fingerprint from frontend
  const body = JSON.parse(event.body || "{}");
  const fingerprint = body.fingerprint || null;

  // Create unique key
  const key = fingerprint ? `fp:${fingerprint}` : `ip:${ip}`;

  // Check if already submitted
  const existing = await store.get(key);
  if (existing) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        status: "duplicate",
        message: "Submission already received"
      })
    };
  }

  // Save submission record
  await store.set(key, {
    submittedAt: new Date().toISOString(),
    ip,
    data: body.payload || {}
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" })
  };
}
