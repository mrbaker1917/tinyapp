const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const { getUserByEmail, generateRandomString, getCurrentDate, urlsForUser } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ["bHbJ8765", "b1P2m3Td"]
}));

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// starter database for urls
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", date: 'Thu Sep 03 2020' },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", date: 'Thu Sep 03 2020' }
};

// starter database for users
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

// checks if current user_id is logged in; if not redirects to login page
// otherwise, provides user home page with that user's tinyURLs
app.get("/urls", (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj === undefined) {
    res.redirect("/login");
  }
  const filteredURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { user: userObj, urlsObjs: filteredURLS, message: "" };
  if (userObj) {
    res.render("urls_index", templateVars);
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// retrieves new URL page to enter URL if logged in
app.get("/urls/new", (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj === undefined) {
    res.redirect("/login");
  }
  if (userObj) {
    const templateVars = { user: userObj, urls: urlDatabase };
    res.render("urls_new", templateVars);
  }
});


// shows registration page for new users
app.get("/register", (req, res) => {
  const userObj = users[req.session.user_id];
  const templateVars = { user: userObj, urls: urlDatabase, message: undefined };
  res.render("register", templateVars);
});

// shows login page for registered user
app.get("/login", (req, res) => {
  const userObj = users[req.session.user_id];
  const templateVars = { user: userObj, urls: urlDatabase, message: undefined };
  res.render("login", templateVars);
});

// shows shortURL edit page
app.get("/urls/:shortURL", (req, res) => {
  const date = getCurrentDate();
  const userObj = users[req.session.user_id];
  if (userObj === undefined) {
    const templateVars = { user: undefined, message: ">> Please login to view your TinyURLs." };
    res.render("login", templateVars);
    return;
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    const filteredURLS = urlsForUser(req.session.user_id, urlDatabase);
    const templateVars = { user: userObj, urlsObjs: filteredURLS, message: ">> That TinyURL does not belong to you." };
    res.render("urls_index", templateVars);
    return;
  } else {
    const templateVars = { user: userObj, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, date: date };
    res.render("urls_show", templateVars);
  }
});

// redirects user to longURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj === undefined) {
    const templateVars = { user: undefined, message: ">> Please login to view your TinyURLs." };
    res.render("login", templateVars);
    return;
  }
});

// registers new users, if not already registered
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    const templateVars = { user: undefined, message: ">> Please enter a valid email and password." };
    res.render("register", templateVars);
    return;
  }
  const foundUser = getUserByEmail(req.body.email, users);
  if (foundUser !== null) {
    res.status(400);
    const templateVars = { user: undefined, message: ">> That email address is already registered. Please login." };
    res.render("login", templateVars);
    return;
  }
  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = { id: userID, email: req.body.email, hashedPassword: hashedPassword };
  req.session.user_id = userID;
  res.redirect("/urls");
});

// creates new TinyURL for longURL and adds to urlDatabase; redirects to tinyURL edit page.
app.post("/urls", (req, res) => {
  const tinyUrl = generateRandomString();
  const date = getCurrentDate();
  urlDatabase[tinyUrl] = { longURL: req.body.longURL, userID: req.session.user_id, date: date };
  res.redirect("/urls/" + tinyUrl);
});

// deletes shortURL prop
app.delete("/urls/:shortURL/", (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj === undefined) {
    return res.redirect("/login");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  }
});

// adds new TinyURL, URL, and user_id to urlDatabase; redirects to show all user's URLs.
app.put("/urls/:shortURL", (req, res) => {
  const userObj = users[req.session.user_id];
  if (userObj === undefined) {
    return res.redirect("/login");
  } else {
    const shortURL = req.params.shortURL;
    const longURL = req.body.newLongURL;
    urlDatabase[shortURL].longURL = longURL;
    //userID = req.session.user_id;
    res.redirect('/urls/');
  }
});

// enables user to login, after checking that email and password are correct.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);
  if (userID === null) {
    res.status(403);
    const templateVars = { user: undefined, message: ">> That email address is not registered. Please create an account." };
    return res.render("register", templateVars);
  }
  if (!bcrypt.compareSync(password, users[userID].hashedPassword)) {
    res.status(403);
    const templateVars = { user: undefined, message: ">> That email and password combination do not match. Please try again." };
    res.render("login", templateVars);
    return;
  }
  if (bcrypt.compareSync(password, users[userID].hashedPassword)) {
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// logs user out of app and deletes session cookie.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});