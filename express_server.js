const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//helper function to display urls based on user
const getUrlsByUser = function(id) {
  const newObject = {
  }
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      newObject[shortURL] = urlDatabase[shortURL]
    }
  }
  return newObject;
}

//helper function to randomize URL and IDs
const generateRandomString = function() {
  return Math.random().toString(36).slice(0, 6);
};

app.get("/register", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const user = users[`${cookieID}`];
  const templateVars = {urls: urlDatabase, user: user};
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const newUser = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  }
  if (!newUser.email || !newUser.password ) {
    return res.status(400).send("Invalid email or password");
  }
  for (const key in users) {
    if (users[key]["email"] === newUser.email) {
      return res.status(400).send("Email already exists");
    }
  }
  users[user_id] = newUser;
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

// Update the POST /login endpoint to look up the email address (submitted via the login form) in the user object.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (const key in users) {
    if(users[key]["email"] === email && users[key]["password"] === password) {
      const validID = users[key]["id"]
      res.cookie("user_id", validID).redirect("/urls");
    }
  }
  return res.status(403).send("403 Forbidden")
});

app.post("/logout", (req, res) => {
  const validID = req.cookies.user_id;
  // const templateVars = {username: username};
  res.clearCookie("user_id", validID);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const user = users[`${cookieID}`];
  const newURLDatabase = getUrlsByUser(cookieID);
  const templateVars = {urls: newURLDatabase, user: user};
  res.render("urls_index", templateVars);
});

//redirects on push of edit button
app.post("/urls", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID: cookieID};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const user = users[`${cookieID}`];
  console.log(user)
  const templateVars = {urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//new route using paramaters.. the ":" in front of the id(shortURL), indicates that shortURL is a parameter and this value will be available in the req.params object
app.get("/urls/:shortURL", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const user = users[`${cookieID}`];
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user:user};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // console.log(urlDatabase)
  // console.log(shortURL)
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});