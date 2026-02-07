// netlify/functions/submitFinal.js
const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const store = getStore("avalonflow-submissions");

    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const fingerprint = body.fingerprint || null;
    const payload = body.payload || {};

    // Get client IP (fallback if no fingerprint)
    const ip =
      event.headers["x-forwarded-for"]?.split(",")[0] ||
      event.headers["client-ip"] ||
      "unknown";

    // Unique key based on fingerprint or IP
    const key = fingerprint ? `fp:${fingerprint}` : `ip:${ip}`;

    // Check if submission already exists
    const existing = await store.get(key);
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          status: "duplicate",
          message: "Submission already received",
        }),
      };
    }

    // Save submission in blob store
    await store.set(key, {
      submittedAt: new Date().toISOString(),
      ip,
      data: payload,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok" }),
    };
  } catch (err) {
    console.error("submitFinal error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: err.message }),
    };
  }
};