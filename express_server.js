const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['asfasdg', 'asfsdge']
}));
const bcrypt = require('bcrypt');


const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "$2b$10$gBqQc0nU7hZ/VNvbXO4wI.3iMdbQgMGF5SmmJ1gFt8ipRgkesGhde"
  },
  "bK562W": {
    id: "bK562W",
    email: "connecshaun@gmail.com",
    password: "$2b$10$gBqQc0nU7hZ/VNvbXO4wI.3iMdbQgMGF5SmmJ1gFt8ipRgkesGhde"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  c4AoTw: { longURL: "https://www.cnn.com", userID: "bK562W" },
  s6KlSr: { longURL: "https://www.lighthouselabs.ca", userID: "bK562W" }
};

//helper function to display urls based on user
const getUrlsByUser = function(id) {
  const newObject = {};

  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      newObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return newObject;
};

//helper function to get user by email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return false;
};

//helper function to randomize URL and IDs
const generateRandomString = function() {
  return Math.random().toString(36).slice(0, 6);
};

app.get("/register", (req, res) => {
  const cookieID = req.session["user_id"];
  const user = users[`${cookieID}`];
  const templateVars = { user: user };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const user_id = generateRandomString();
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const newUser = {
    id: user_id,
    email: email,
    password: hashedPassword
  };
  if (!newUser.email || !newUser.password) {
    return res.status(400).send("Invalid email or password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }
  users[user_id] = newUser;
  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const validID = getUserByEmail(email, users);
  const newPassword = req.body.password;
  if (getUserByEmail(email, users) && (bcrypt.compareSync(newPassword, users[validID]["password"]))) {
    req.session.user_id = validID;
    return res.redirect("/urls");
  }
  return res.status(403).send("403 Forbidden");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const cookieID = req.session["user_id"];
  const user = users[`${cookieID}`];
  const newURLDatabase = getUrlsByUser(cookieID);
  const templateVars = { urls: newURLDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const cookieID = req.session["user_id"];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID: cookieID };
  if (cookieID) {
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.session["user_id"];
  const user = users[`${cookieID}`];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieID = req.session["user_id"];
  const user = users[`${cookieID}`];
  const newURLDatabase = getUrlsByUser(cookieID);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: newURLDatabase[req.params.shortURL]["longURL"], user: user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (cookieID) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const cookieID = req.session["user_id"];
  const newURLDatabase = getUrlsByUser(cookieID);
  const longURL = newURLDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.post("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});