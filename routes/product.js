const express = require("express");
const router = express.Router();
const fs = require('fs-extra');
const Product = require("../models/products");
const Category = require("../models/category");
const Swal = require('sweetalert2');
const category = require("../models/category");
var auth = require('../config/auth');
var isUser = auth.isUser;

router.get('/products',isUser,function(req,res){
    Product.find(function(err, products){
        if(err)
            console.log(err);
        
        res.render('all_Product',{
            title: 'All product',
            products : products,
        });  
    })
});

router.get('/:category',function(req,res){

    var categoryslug = req.params.category;

    Category.findOne({slug : categoryslug}, function(err,c){
        Product.find({category : categoryslug},function(err, product){
            if(err)
                console.log(err);

            res.render('cat_Product',{
                title: product.title,
                product : product
            }); 
            console.log(product);
        })
    })
});

router.get('/:category/:product',function(req,res){

    var gallerryImage = null;

    var logedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug : req.params.product},function(err, product){
       
        if(err){
            console.log(err);
        }else{
            
            var galleryDir = 'public/product-images/' + product._id + '/gallery';
            fs.readdir(galleryDir, function(err, files) {
                if(err){
                    console.log(err);
                }else {
                    gallerryImage = files;

                    res.render('product',{
                        title: product.title,
                        product : product,
                        gallerryImage : gallerryImage,
                        logedIn : logedIn
                    }); 
                }
            })
        }
    })
});

module.exports = router;