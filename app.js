const express = require('express');
const path = require('path');
//Init app
const app= express();
var hbs = require('express-handlebars');
const mongoose = require('mongoose');
//bring in moodels
let Article= require('./models/article');
var bodyParser = require('body-parser');

let db = mongoose.connection;
var session = require('express-session');
var expressValidator = require('express-validator');
//var flash = require('connect-flash');
var flash = require('express-flash');
let articles = require('./routes/articles');
let users = require('./routes/users');
const config = require('./config/database')
const passport = require('passport');

mongoose.connect(config.database);
db.once('open',()=>{console.log('connected to mongodb');});

//body parser middleware parse application
app.use(bodyParser.urlencoded({extended:false}));

//parse application/json
app.use(bodyParser.json());

//check for db errors
db.on('error',(err)=>{console.log(err)})

app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout'}));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');



// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

  //express messages middleware sets global var called messages
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  app.use(flash());
// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));



require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
res.locals.user = req.user||null;
next();
});

app.get('/',(req,res)=>
{
    
Article.find({},(err,articles)=>{
if(err){
    console.log(err);
}else{
    res.render('index',{title:'jish',articles:articles,expressFlash: req.flash('success'), sessionFlash: res.locals.sessionFlash});
}
    
});
});


app.use('/articles',articles);
app.use('/users',users);

//start server
app.listen(3000,()=>{console.log('server started on port 3000');});