const { assert, expect } = require('chai');

const { fetchUser } = require('../helpers/userHelpers.js');

const testUsers = {
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

describe('fetchUser', () => {
  it('should return a user object with valid email', function() {
    const user = fetchUser(testUsers, "user@example.com")
    const expectedOutput = testUsers["userRandomID"];
    assert.equal(user, expectedOutput);
  });

  it('should return null if the email does not exist in the user database', function() {
    const user = fetchUser(testUsers, "user@example.ca")
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});

