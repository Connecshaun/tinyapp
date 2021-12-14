


//helper function to display urls based on user
const getUrlsByUser = function (id, urlDatabase) {
  const newObject = {};

  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      newObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return newObject;
};

//helper function to get user by email
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user]["email"] === email) {
      return user;
    }
  }
  return undefined;
};

//does URL belong to active user 
const usersURL = function (activeUserID, database, shortURLID) {
  const urlUserID = database[shortURLID]["userID"];
  if (urlUserID === activeUserID) {
    return true;
  }
  return false;
}

//helper function to randomize URL and IDs
const generateRandomString = function () {
  return Math.random().toString(36).slice(0, 6);
};

module.exports = { getUrlsByUser, getUserByEmail, usersURL, generateRandomString };