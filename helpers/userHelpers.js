const emailExists = (userDatabase, email) => {
  if (userDatabase[email]) {
    return true;
  } else {
    return false;
  }
};




module.exports = { emailExists };