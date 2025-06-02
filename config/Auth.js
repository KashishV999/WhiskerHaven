const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.SECRET_KEY);
};

module.exports = { generateToken };
