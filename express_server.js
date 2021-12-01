
const express = require("express");
const app = express();
const PORT = 8080;

//tells our express app to use EJS as its template engine
app.set("view engine", "ejs");

//install and require body-parser to make a POST request readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//install and require cookie parser
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
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(0, 6);
};

//REQUEST && RESPONSE
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
  // console.log(users)
  for (const key in users) {
    // console.log(users[key].email, newUser.email);
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

app.post("/login", (req, res) => {
  const username = req.body.username; 
  res.cookie("username", username);
  const templateVars = { username: username};
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username; 
  const templateVars = {username: username};
  res.clearCookie("username", username);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const user = users[`${cookieID}`];
  const templateVars = {urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.cookies["user_id"];
  const user = users[`${cookieID}`];
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