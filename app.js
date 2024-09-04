const express = require("express");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const bcrypt = require("bcrypt");
const PORT = 3000;
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data

app.use(
  session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  }),
);

function isAuthenticated(req, res, next) {
  console.log(req.session);
  console.log(req.session.user);
  if (req.session.user) return next();
  res.status(401).json({ error: "Unauthorized, please log in first" });
}
app.use(express.static(path.join(__dirname, "public")));
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

let links = [];
let users = [];

// Middleware to check if a user is authenticated

// Register a new user

const register = (username, password) => {
  const hashedPassword = bcrypt.hash(password, 10);
  users.push({ id: uuidv4(), username, password: hashedPassword });
  return { username, password: hashedPassword };
};
app.post("/api/register", async (req, res) => {
  register(req.body.username, req.body.password);
  res.status(201).json({ message: "User registered successfully" });
});

// Login a user
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user; // Set session
    res.json({ message: "Login successful" });
  } else {
    // register the user
    register(req.body.username, req.body.password);
    res.status(201).json({ message: "User registered successfully" });
  }
});

// Logout a user
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logout successful" });
});

app.post("/api/links", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const newLink = {
    id: uuidv4(),
    url,
    timestamp: new Date().toISOString(),
    userId: req.session.user ? req.session.user.id : "ANON", // Associate the link with the user
  };

  links.push(newLink);
  res.status(201).json({ message: "Link added successfully", link: newLink });
});
// Add a new link (requires authentication)
// app.post("/api/links", isAuthenticated, (req, res) => {
//   const { url } = req.body;
//   if (!url) {
//     return res.status(400).json({ error: "URL is required" });
//   }
//
//   const newLink = {
//     id: uuidv4(),
//     url,
//     timestamp: new Date().toISOString(),
//     userId: req.session.user.id, // Associate the link with the user
//   };
//
//   links.push(newLink);
//   res.status(201).json({ message: "Link added successfully", link: newLink });
// });
// app.get("/api/links", isAuthenticated, (req, res) => {
//   console.log(links);
//   const userLinks = links.filter((link) => link.userId === req.session.user.id);
//   res.json(userLinks);
// });
app.get("/api/links", (req, res) => {
  res.json(links);
});

app.listen(PORT, () => {
  console.log(`LinkBucket server running at http://localhost:${PORT}`);
});
app.use("/", indexRouter);
app.use("/users", usersRouter);
