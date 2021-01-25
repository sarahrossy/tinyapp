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

function generateRandomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};


module.exports = { emailOrPasswordEmpty, fetchUser, databaseFilter, generateRandomString };