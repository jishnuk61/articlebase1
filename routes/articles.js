const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const User = require('../models/user');
// add routes
router.get('/add',(req,res)=>
{
    

    res.render('add_article',{title:'articles'});

});

//submit new article 

router.post('/add',ensureAuthenticated,(req,res)=>{


    req.checkBody('articletitle','Title is required').notEmpty();
    //req.checkBody('articleauthor','Author is required').notEmpty();
    req.checkBody('articledescription','description is required').notEmpty();

    //get errors
    let errors = req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('add_article',{
            title:'Add article',
            errors:errors
        });
    }else{
        
        let article = new Article();
        
          article.title=req.body.articletitle;
          article.author = req.user._id;
          article.body=req.body.articledescription;
      
          article.save(err=>{
              if(err){
                  console.log(err);
              return;
          } else {
              req.flash('success','Article added');
              res.redirect('/');
          }
      
      });
    }

   
});



//update submit new article 
router.post('/edit/:id',ensureAuthenticated,(req,res)=>{
    let article = {};
  
    article.title=req.body.articletitle;
    article.author = req.body.articleauthor;
    article.body=req.body.articledescription;
let query ={_id:req.params.id};

Article.update(query,article,err=>{
        if(err){
            console.log(err);
        return;
    } else {
        res.redirect('/');
    }

});
});




//delete request
router.delete('/:id',ensureAuthenticated,(req,res)=>{
    console.log('inside delete route');

    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id};
Article.findById(req.params.id,(err,article)=>{
    if(article.author!=req.user._id){
        res.status(500).send();
    }else{
        Article.remove(query,err=>{
            if(err){
                console.log(err);
            }
        else{
            res.send('Success');
        }    });
    }
});

    
});


//Load edit form
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        if(article.author!=req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        }
    res.render('edit_article',{article:article});
    });
    });
//get single article
router.get('/:id',(req,res)=>{Article.findById(req.params.id,(err,article)=>{
    User.findById(article.author,(err,user)=>{
        res.render('article',{article:article,author:user.name});
    });
    
    });
    });




    //access control
    function ensureAuthenticated(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }else{
            req.flash('danger','Please login to continue');
            res.redirect('/users/login');
        }
    }
    module.exports = router;