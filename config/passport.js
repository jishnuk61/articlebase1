const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    console.log('Hi i am inside local strategy '+username);
    let query = {username:username};
    User.findOne(query, function(err, user){
      if(err) {throw err;
    console.log('error in findone method = '+err);
    }
      if(!user){
        console.log('no user found = '+user);
        return done(null, false, {message: 'Invalid credentials'});
      }
//In case of an Error interacting with our database, we need to invoke done(err). 
//When we cannot find the user or the passwords do not watch, we invoke done(null, false).
// If everything went fine and we want the user to login we invoke done(null, user)
      // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
           
          return done(null, false, {message: 'Invalid Credentials'});
        }
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}