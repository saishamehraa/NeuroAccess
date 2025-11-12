import fetch from "node-fetch";

const SUPABASE_URL = "https://vlbuwyelhardsrhrprym.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnV3eWVsaGFyZHNyaHJwcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTQxOTcsImV4cCI6MjA3NDk3MDE5N30.8Sjnj5k7q3y0J7aSx5LEOB888Y0T0cXTpoOK1IZTj-I";

async function keepAlive() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log("✅ Ping sent successfully at", new Date().toLocaleString());
  } catch (error) {
    console.error("❌ Failed to ping Supabase:", error.message);
  }
}

await fetch(`${SUPABASE_URL}/rest/v1/rpc/ping_check`, {
  method: "POST",
  headers: {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json"
  }
});


// Run immediately
keepAlive();
