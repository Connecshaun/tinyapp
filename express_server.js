const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUrlsByUser, getUserByEmail, generateRandomString, usersURL } = require('./helpers');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['asfasdg', 'asfsdge']
}));
app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  const cookieID = req.session["user_id"];
  if (cookieID) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
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
  return res.status(403).send("Oops, you may have forgotten to input your login details 🙃");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const cookieID = req.session["user_id"];
  const user = users[`${cookieID}`];
  const newURLDatabase = getUrlsByUser(cookieID, urlDatabase);
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
  const shortURL = req.params.shortURL;
  const newURLDatabase = getUrlsByUser(cookieID, urlDatabase);
  if (usersURL(cookieID, urlDatabase, shortURL)) {
    const templateVars = {
      shortURL: shortURL,
      longURL: newURLDatabase[shortURL]["longURL"], user: user
    }
    res.render("urls_show", templateVars);
  } else {
    return res.status(403).send("Sadly, this URL is not yours to edit. 🙁");
  }

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
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  if (cookieID) {
    return res.redirect(longURL);
  } else {
    return res.status(403).send("Please login to access URLs 🙂");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});