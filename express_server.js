const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const generateRandomString = () => {
  let ranStr = "";
  const alphaNum = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    let randIndex = Math.floor(Math.random() * 61);
    ranStr += alphaNum[randIndex];
  }
  return ranStr;
};

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const lookUpUserByEmail = (email) => {
  console.log(users);
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

app.get("/urls", (req, res) => {
  let userObj = users[req.cookies.user_id];
  let templateVars = { user: userObj, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userObj = users[req.cookies.user_id];
  let templateVars = { user: userObj, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let userObj = users[req.cookies.user_id];
  let templateVars = { user: userObj, urls: urlDatabase };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let userObj = users[req.cookies.user_id];
  let templateVars = { user: userObj, urls: urlDatabase };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Please enter a valid email and password.");
    return;
  }
  let foundUser = lookUpUserByEmail(req.body.email);
  if (foundUser !== null) {
    res.status(400);
    res.send("That email address is already registered.");
    return;
  }
  let userID = generateRandomString();
  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const tinyUrl = generateRandomString();
  urlDatabase[tinyUrl] = req.body.longURL;
  res.redirect("/urls/" + tinyUrl);
});

app.get("/urls/:shortURL", (req, res) => {
  let userObj = users[req.cookies.user_id];
  let templateVars = { user: userObj, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.newLongURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = lookUpUserByEmail(email);
  if (userID === null) {
    res.status(403);
    res.send("No user with that email address is registered.");
    return;
  }
  if (users[userID].password !== password) {
    res.status(403);
    res.send("Something is wrong with your email or password.");
    return;
  }
  if (users[userID].password === password) {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  urlDatabase = {};
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});