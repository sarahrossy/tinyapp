const emailExists = (userDatabase, email) => {
  if (userDatabase[email]) {
    return true;
  } else {
    return false;
  }
};

const emailOrPasswordEmpty = (email, password) => {
  if (email === "" || password === "") {
    return true;
  } else {
    return false;
  }
};

const fetchUser = (userDatabase, email) => {
  for (let key in userDatabase) {
    if (userDatabase[key].email === email) {
      return userDatabase[key];
    }
  } return null;
};

// loop through the keys
// use the key to access the entire user
// then have access to use's email
// compare against email address that was passed in
// if equal, we've found the user

module.exports = { emailExists, emailOrPasswordEmpty, fetchUser };