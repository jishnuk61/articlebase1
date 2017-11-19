const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');
var bodyParser = require('body-parser');
//Register form
router.get('/register',function(req,res){
    res.render('register',{title:'Registration form'});
});


// register a new user
router.post('/register',(req,res)=>{
    
        const name = req.body.firstname;
        const email = req.body.useremail;
        const username = req.body.username;
        const password = req.body.userpassword;
        const confirmpassword = req.body.userconfirmpassword;



        req.checkBody('firstname','First Name is required').notEmpty();
        req.checkBody('username','Username is required').notEmpty();
        req.checkBody('useremail',' email is required').isEmail();
        req.checkBody('userpassword','Password is required').notEmpty();
        req.checkBody('userconfirmpassword','Password does not match').equals(password);
    
        //get errors
        let errors = req.validationErrors();
        if(errors){
            console.log(errors);
            res.render('register',{
                title:'Registration',
                errors:errors
            });
        }else{
            
            let newUser = new User();
            newUser.name=name;
            newUser.email =email;
            newUser.username=username;
            newUser.password=password;

            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err){
                        console.log(err);
                    }
                    newUser.password = hash;
                    
                    newUser.save(err=>{
                        if(err){
                            console.log(err);
                        return;
                    } else {
                        req.flash('success','Registration successful');
                        res.redirect('/users/login');
                    }
                
                });
                });
            });
        
        }
    
       
    });

// get the login form
    router.get('/login',(req,res)=>{
        res.render('login',{title:'Login'});
    });

// login form post method
router.post('/login',(req,res,next)=>{
    console.log('I am inside post method');
    passport.authenticate('local',{successRedirect:'/',failureRedirect:'/users/login',
failureFlash:true})(req,res,next);
});



//tester
	
// router.post('/login', bodyParser.urlencoded({ extended: true }), function (req, res, next) {
//     var username = req.body.username;
//     var password = req.body.userpassword;
    
//     console.log(username);
//           passport.authenticate('local', function (err, username, info) {
//               console.log(username);
//                if (err) {
//                    console.log(err); 
//                    return next(err); }
//                if (!username) {
//                     console.log('no user? ');
//                     console.log(info.message);
//                     return res.redirect('/users/login')
//                }
//                req.logIn(user, function (err) {
//                     console.log('good');
//                     if (err) { return next(err); }
//                     return res.redirect('/');
//                });
//           })(req, res, next);
//      });

//logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','You are logged out');
    res.redirect('/users/login');
});

module.exports = router;