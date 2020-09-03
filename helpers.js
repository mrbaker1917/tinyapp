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

module.exports = { getUserByEmail, generateRandomString };