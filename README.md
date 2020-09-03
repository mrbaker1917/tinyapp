# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Once a user registers or logs in, they can enter a URL and get a six-character TinyURL to use in its place.
They can also edit and delete these TinyURLs. They must be logged in to do anything with the TinyURLs, but a non-logged in
user can access the edit page in order to click the link to the longURL.

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` (or if nodemon installed, `npm start`) command.

## Security
- The app uses cookie-sessions to encrypt cookies during a logged in session; these cookies are deleted at logout.
- The app also uses bcrypt to hash passwords.
- Users who are not logged in cannot access TinyURLs, edit or delete them.

### Please feel free to suggest changes. 