const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = () => {
  let ranStr = "";
  const alphaNum = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    let randIndex = Math.floor(Math.random() * 61);
    ranStr += alphaNum[randIndex];
  }
  return ranStr;
};

const getCurrentDate = () => {
  let date = new Date().toString().slice(3, 15);
  return date;
};

// filters URLs for specific user to view
const urlsForUser = (id, database) => {
  const filteredDB = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      filteredDB[shortURL] = database[shortURL];
    }
  }
  return filteredDB;
};

module.exports = { getUserByEmail, generateRandomString, getCurrentDate, urlsForUser };