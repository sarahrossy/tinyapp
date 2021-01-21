const urlDatabase = {
  
  b6UTxQ: 
  { longURL: "https://www.tsn.ca",
    userID: "aJ48lW" },
  
  i3BoGr:
  { longURL: "https://www.google.ca",
    userID: "4728fh" },

  i3BoGf:
  { longURL: "https://www.google.ca",
    userID: "4728fh" }
};

// we want to extract the information for a specific userID

const userID = "4728fh";

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


const expectedOutcome = {
  i3BoGr:
  { longURL: "https://www.google.ca",
    userID: "4728fh" },
  
    i3BoGf:
  { longURL: "https://www.google.ca",
    userID: "4728fh" }
}