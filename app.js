const express = require("express");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const db = require("@supabase/supabase-js");
const PORT = 3000;
const app = express();
const KEY = process.env.SUPABASE_KEY;
const URL = process.env.SUPABASE_URL;
const supabase = db.createClient(URL, KEY);

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify Supabase JWT token
async function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.use(express.static(path.join(__dirname, "public")));

// Auth endpoints
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
});

app.post("/api/auth/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Logged out successfully" });
});

// Protected routes using isAuthenticated middleware
app.post("/api/links", isAuthenticated, async (req, res) => {
  const { url, title } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  
  const link = {
    url,
    title,
    timestamp: new Date().toISOString(),
    user_id: req.user.id,
  };
  
  const { data, error } = await supabase.from("links").insert([link]);

  if (error) {
    res.status(400).json({ message: error.message });
  } else {
    res.status(201).json({ message: "Link added successfully", link: link });
  }
});

// Only show links for the authenticated user
app.get("/api/links", isAuthenticated, async (req, res) => {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) {
    res.status(400).json({ message: error.message });
  } else {
    res.json(data);
  }
});

app.delete("/api/links/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id); // Ensure users can only delete their own links

  if (error) {
    res.status(400).json({ message: error.message });
  } else {
    res.json({ message: "Link deleted successfully", data });
  }
});

app.listen(PORT, () => {
  console.log(`LinkBucket server running at http://localhost:${PORT}`);
});
