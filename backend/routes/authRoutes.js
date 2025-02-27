const express = require("express");
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');

const {
  registerUser,
  loginUser,
  logoutUser,
  resetpasswordrequest,
  resetpassword,
  checkEmailExists,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", resetpasswordrequest);
router.post("/reset-password", resetpassword);
router.get("/check-email", checkEmailExists);

// Add authentication check endpoint
router.get("/check", (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT || 'mekarahasak');
    res.json({ isAuthenticated: true, user: decoded });
  } catch (err) {
    res.status(401).json({ isAuthenticated: false });
  }
});

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login'
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, isAdmin: req.user.isAdmin },
      process.env.JWT
    );

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      })
      .redirect(
        `http://localhost:3000/oauth/success?user=${encodeURIComponent(
          JSON.stringify({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            img: req.user.img,
            type: req.user.type,
            country: req.user.country,
            mobile: req.user.mobile,
            isAdmin: req.user.isAdmin
          })
        )}`
      );  }
);

module.exports = router;
