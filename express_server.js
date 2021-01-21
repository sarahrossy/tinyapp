const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser"); // used for post requests, turns JSON (string) into JS
const cookieParser = require('cookie-parser');
const { emailExists, emailOrPasswordEmpty, fetchUser } = require('./helpers/userHelpers');
const app = express(); // creates an express server called app
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// }; 

const urlDatabase = {
  b6UTxQ: 
  { longURL: "https://www.tsn.ca",
  userID: "aJ48lW" },
  i3BoGr:
  { longURL: "https://www.google.ca",
  userID: "aJ48lW" }
};

const users = { 
  "userRandomID":
  {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID":
 {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  //console.log(templateVars.urls);
  res.render("urls_index", templateVars);
});

//DONE
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6, '#a');
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { 
    longURL: longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`); 
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`); 
});

// update longUrl in the database (change longURL to newLongURL)
// redirect back to URL homepage
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = { 
    longURL: req.body.newLongURL,
    userID: req.cookies['user_id']
  };
  //console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("login", templateVars); 
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const submittedPassword = req.body.password;
  
  if (fetchUser(users, email)) {
    const user = fetchUser(users, email);
      if (user.password === submittedPassword) {
        res.cookie('user_id', user.id);
        res.redirect('/urls');
      } else {
        console.log("Passwords do not match!")
        res.sendStatus(404);
      };
  } else if (!fetchUser(users, email)) {
    console.log("User is not registered in our database!")
    res.sendStatus(404);
  }
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: users[userID]
  };
  res.render('registration', templateVars);

});

app.post("/register", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingName = req.body.name;
  const incomingPassword = req.body.password;
  if (emailExists(users, incomingEmail)) {
    console.log("email already exists");
    res.redirect('/register');
  } else if (emailOrPasswordEmpty(incomingEmail, incomingName)) {
    console.log("email or password are blank fields")
    res.sendStatus(404);
  } else if (fetchUser(users, incomingEmail)) {
    console.log("user already exists!");
    res.sendStatus(404);
  } else {
    console.log(users);
    const newUser = {
      // name: incomingName,
      email: incomingEmail,
      password: incomingPassword
    }
    const newUserID = generateRandomString(6, '#a');
    users[newUserID] = newUser;
    res.cookie('user_id', newUserID);
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: shortURL,
    //cannot read property "longURL" pf undefined
    longURL: urlDatabase[shortURL].longURL,
    user: req.cookies['user_id']
  }; 
  res.render("urls_show", templateVars);
  //console.log(templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
