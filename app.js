const express = require("express");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const PORT = 3000;
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

let links = [];

// API to get all links
app.get("/api/links", (req, res) => {
  res.json(links);
});
app.post("/api/links", (req, res) => {
  console.log(req.body);
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const newLink = {
    id: uuidv4(), // Generate a unique ID for the link
    url,
    timestamp: new Date().toISOString(), // Record the current timestamp
  };

  // Add the link to the array
  links.push(newLink);
  res.status(201).json({ message: "Link added successfully", link: newLink });
});

// API to delete a link by ID
app.delete("/api/links/:id", (req, res) => {
  const id = req.params.id;
  links = links.filter((link) => link.id !== id);
  res.status(200).json({ message: "Link deleted successfully" });
});
app.listen(PORT, () => {
  console.log(`LinkBucket server running at http://localhost:${PORT}`);
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
