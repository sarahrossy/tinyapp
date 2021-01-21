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

const databaseFilter = (userID, urlDatabase) => {
  // create an empty object that we want to fill
  const filteredUrlDatabase = {};

  // loop through original object
  for (const key in urlDatabase){

    // identify where the userID lives in the object, and compare
    const currentUserID = urlDatabase[key].userID;
    if (currentUserID === userID){

      // fill object of all objects that have the userID
      filteredUrlDatabase[key] = urlDatabase[key];
    } 
  }
  // return object
  return filteredUrlDatabase;
};

// loop through the keys
// use the key to access the entire user
// then have access to use's email
// compare against email address that was passed in
// if equal, we've found the user

const urlsForUser = (id) => {

};

module.exports = { emailExists, emailOrPasswordEmpty, fetchUser, databaseFilter };