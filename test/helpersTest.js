const { assert } = require('chai');

const { getUserByEmail, generateRandomString } = require('../helpers');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if email not in database', function() {
    const actual = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(actual, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a string of six characters', function() {
    const actual = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(actual, expectedOutput);
  });
  it("generates different strings of six characters each time", function() {
    const actual1 = generateRandomString();
    const actual2 = generateRandomString();
    assert.notEqual(actual1, actual2);
  });
});