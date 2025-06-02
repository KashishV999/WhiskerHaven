// =============================================================================
// Authentication Routes
// =============================================================================
// Handles user registration, login, logout, and Google OAuth.

const express = require("express");
const passport = require("passport");
const router = express.Router();
const db = require("../config/database");
const { generateToken } = require("../config/Auth");

// =============================================================================
// User Registration
// =============================================================================
router.post("/register", (req, res) => {
  db.registerUser(req.body)
    .then((msg) => res.json({ message: msg }))
    .catch((msg) => res.status(422).json({ message: msg }));
});

// =============================================================================
// User Login
// =============================================================================
router.post("/login", (req, res) => {
  db.checkUser(req.body)
    .then((user) => {
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });
      //res.redirect(user.role === "admin" ? "/admin/cats" : "/cats");
      res.json({ message: "Login successful", user });
    })
    .catch((msg) => res.status(422).json({ message: msg }));
});

// =============================================================================
// Google OAuth Authentication
// =============================================================================
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// =============================================================================
// Google OAuth Callback
// =============================================================================
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = generateToken(req.user); // That Google-authenticated user is now using JWT too.
    res.cookie('token', token, { httpOnly: true, secure: false });
    res.redirect('/cats');
  }
);


// =============================================================================
// Facebook OAuth Authentication
// =============================================================================
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// =============================================================================
// Facebook OAuth Callback
// =============================================================================
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = generateToken(req.user); // That Facebook-authenticated user is now using JWT too.
    res.cookie('token', token, { httpOnly: true, secure: false });
    res.redirect('/cats');
  }
);
// =============================================================================
// User Logout
// =============================================================================
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/cats");
});

module.exports = router;