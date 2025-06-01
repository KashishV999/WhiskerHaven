// =============================================================================
// Authentication Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, JWT
// Description: This file defines all authentication-related routes, including user registration, login, and logout.
// =============================================================================

const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { generateToken } = require("../config/Auth");

// =============================================================================
// User Registration
// =============================================================================
router.post("/register", (req, res) => {
  db.registerUser(req.body)
    .then((msg) => {
      res.json({ message: msg });
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});

// =============================================================================
// User Login
// =============================================================================
router.post("/login", (req, res) => {
  db.checkUser(req.body)
    .then((user) => {
      const token = generateToken(user);

      console.log("Token generated:", token);

      // Set token as HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect based on role
      if (user.role === "admin") {
        res.redirect("/admin/cats");
      } else if (user.role === "user") {
        res.redirect("/cats");
      }
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});

// =============================================================================
// User Logout
// =============================================================================
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/cats");
});

module.exports = router;