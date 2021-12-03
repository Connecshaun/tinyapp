


//helper function to display urls based on user
const getUrlsByUser = function(id,urlDatabase) {
  const newObject = {};

  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      newObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return newObject;
};

//helper function to get user by email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user]["email"] === email) {
      return user;
    }
  }
  return false;
};

//helper function to randomize URL and IDs
const generateRandomString = function() {
  return Math.random().toString(36).slice(0, 6);
};

module.exports = {getUrlsByUser, getUserByEmail, generateRandomString};