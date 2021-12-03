const { assert } = require("chai");
const { getUserByEmail } = require("../helpers.js");

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "$2b$10$gBqQc0nU7hZ/VNvbXO4wI.3iMdbQgMGF5SmmJ1gFt8ipRgkesGhde"
  },
  "bK562W": {
    id: "bK562W",
    email: "connecshaun@gmail.com",
    password: "$2b$10$gBqQc0nU7hZ/VNvbXO4wI.3iMdbQgMGF5SmmJ1gFt8ipRgkesGhde"
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", users);
    const expectedOutput = "aJ48lW";
    assert.equal(user, expectedOutput);
  });
  it("should return undefined if user email is not in our urls database", function() {
    const user = getUserByEmail("hellojello@pudding.com", users);
    const expectedOutput = undefined;
    assert.isUndefined(user, expectedOutput);
  });
  it("should return undefined if no email is entered", function() {
    const user = getUserByEmail(users);
    const expectedOutput = undefined;
    assert.isUndefined(user, expectedOutput);
  });
});