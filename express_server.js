
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


//REQUEST && RESPONSE
const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

app.get("/register", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("registration", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username; 
  const templateVars = { username: username};
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username; 
  const templateVars = {username: username};
  res.clearCookie("username", username);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

const generateRandomString = function() {
  return Math.random().toString(36).slice(0, 6);
};

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]}
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
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
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