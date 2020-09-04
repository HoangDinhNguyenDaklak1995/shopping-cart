const express = require("express");
const router = express.Router();
const Page = require("../models/pages");
const Product = require('../models/products');
const Category = require("../models/category");
const User = require('../models/user');
const passport = require("passport");
var bcript = require('bcryptjs');


router.get('/', function(req,res){
    if(res.locals.user) res.redirect('/index');
    res.render('login', {});
});

router.post('/', function(req,res,next){
    passport.authenticate('local', {
        successRedirect: '/index',
        failureRedirect : '/',
        failureFlash : true
    })(req,res,next);
});

router.get('/logout', function(req,res){
    req.logout();
    req.flash('success', 'You are Logout pages !');
    res.redirect('/');
});

router.get('/register', function(req,res){
    res.render('register', {});
});

router.post('/register', function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    req.checkBody('name', 'Name have must a value').notEmpty();
    req.checkBody('email', 'Email have must a value').notEmpty();
    req.checkBody('username', 'Username have must a value').notEmpty();
    req.checkBody('password', 'Password have must a value').notEmpty();
    req.checkBody('confirm-password', 'Repassword is not match').equals(password);

    var errors = req.validationErrors();
    if(errors){
        res.render('register', {
            title : 'register',
            user : null,
            errors : errors
        });
    }else {
        User.findOne({username : username}, function(err,user){
            if(err) 
                console.log(err);

            if(user){
                req.flash('danger', 'User exist !');
                res.redirect('/register');
            }else {
                var user = new User({
                    name : name,
                    username : username,
                    password : password,
                    email : email,
                    admin : 0
                });
                bcript.genSalt(10, function(err,salt){
                    bcript.hash(user.password,salt , function(err, hash){
                        if(err)
                            console.log(err);

                        user.password = hash;

                        user.save(function(err){
                            if(err){
                                console.log(err);
                            }else{
                                req.flash('success', 'You are now register !');
                                res.redirect('/');
                            }
                        });
                    })
                });
            }
        })
    }
});

router.get('/index', function (req, res) {
    Page.findOne({slug: 'home'}, function (err, page) {
        Category.find(function (err, Category) {
            Product.find(function (err, product) {
                if (err)
                    return console.log(err);

                if (!page) {
                    res.redirect('/');
                } else {
                    res.render('index', {
                        page: page,
                        product: product,
                        Category: Category
                    });
                }
            })
        })
    })

});

router.get('/:slug', function (req, res) {

    var slug = req.params.slug;

    Page.findOne({
        slug: slug
    }, function (err, page) {
        Category.find(function (err, Category) {
            Product.find(function (err, product) {
                if (err)
                    return console.log(err);

                if (!page) {
                    res.redirect('/index');
                } else {
                    res.render('index', {
                        page: page,
                        product: product,
                        Category: Category
                    });
                }
            })
        })
    })
});

module.exports = router;