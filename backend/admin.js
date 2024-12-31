(function() {
    var express, isLoggedIn, passport, router;
  
    express = require('express');
  
    passport = require('passport');
   // include the your passport.js file path
    require('./passport.js');
  
    router = express.Router();
  
    isLoggedIn = function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect("/admin");
    };
  
    router.get('/', function(req, res) {
      return res.render('admin/admin_index.jade');
    });
  
    router.get('/editor', isLoggedIn, function(req, res) {
      return res.render('admin/admin_editor.jade');
    });
  
    router.get('/auth/google', passport.authenticate('google', {
      scope: ['profile', 'email']
    }));
  
    router.get('/auth/google/callback', passport.authenticate('google', {
      successRedirect: '/editor',
      failureRedirect: '/'
    }));
  
    module.exports = router;
  
  }).call(this);