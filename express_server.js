const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id) => {
  const filteredDB = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filteredDB[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return filteredDB;
};

app.get("/urls", (req, res) => {
  let userObj = users[req.cookies.user_id];

  if (userObj === undefined) {
    res.redirect("/login");
  }
  const filteredURLS = urlsForUser(req.cookies.user_id);
  let templateVars = { user: userObj, urls: filteredURLS };
  if (userObj) {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let userObj = users[req.cookies.user_id];
  if (userObj === undefined) {
    res.redirect("/login");
  }
  if (userObj) {
    let templateVars = { user: userObj, urls: urlDatabase };
    res.render("urls_new", templateVars);
  }
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
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = { id: userID, email: req.body.email, hashedPassword: hashedPassword};
  res.cookie('user_id', userID);
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  const tinyUrl = generateRandomString();
  urlDatabase[tinyUrl] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  res.redirect("/urls/" + tinyUrl);
});

app.get("/urls/:shortURL", (req, res) => {
  let userObj = users[req.cookies.user_id];
  let templateVars = { user: userObj, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// deletes shortURL prop
app.post("/urls/:shortURL/delete", (req, res) => {
  let userObj = users[req.cookies.user_id];
  if (userObj === undefined) {
    return res.redirect("/login");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let userObj = users[req.cookies.user_id];
  if (userObj === undefined) {
    return res.redirect("/login");
  } else {
    const shortURL = req.params.shortURL;
    const longURL = req.body.newLongURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies.user_id };
    res.redirect('/urls/');
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = lookUpUserByEmail(email);
  if (userID === null) {
    res.status(403);
    return res.redirect("/register");
  }
  if (!bcrypt.compareSync(password, users[userID].hashedPassword)) {
    res.status(403);
    res.send("Something is wrong with your email or password.");
    return;
  }
  if (bcrypt.compareSync(password, users[userID].hashedPassword)) {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});