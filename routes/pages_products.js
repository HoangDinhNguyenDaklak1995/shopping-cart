const express = require("express");
const router = express.Router();
var Product = require("../models/products");
var Category = require("../models/category");
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const { findById } = require("../models/category");
const Swal = require('sweetalert2');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

router.get('/',isAdmin,function(req,res){
    var count;
    Product.count(function(req,c){
        count = c;
    });

    Product.find(function(err, products){
        if(err) return console.log(err);
        res.render("admin/products",{
            products : products,
            count : count
        });
    });
});

router.get('/add-Products',function(req,res){

    var title ="";
    var desc = "";
    var price = "";
    Category.find(function(err, categories){
        res.render('admin/add_products', {
            title : title,
            desc : desc,
            categories : categories,
            price : price
        });
    })
});

router.post('/add-Products',function(req,res){

    var imageFile;
    if(!req.files){
         imageFile =""; 
    }
    if(req.files){
        imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
    req.checkBody('title', 'Title have must a value').notEmpty();
    req.checkBody('desc', 'Description have must a value').notEmpty();
    req.checkBody('price', 'Price have must a value').isDecimal();
    req.checkBody('image', 'You must upload is images').isImage(imageFile);
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        onOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      
      Toast.fire({
        icon: 'success',
        title: 'Signed in successfully'
      })
    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var errors = req.validationErrors();

    if(errors) {
        Category.find(function(err, categories){
            res.render('admin/add_products', {
                errors : errors,
                title : title,
                desc : desc,
                categories : categories,
                price : price
            });
        })
    }else{
        Product.findOne({slug : slug}, function(err,products){
            if(products){
                req.flash('danger','Products title exist, choose another.');
                res.render('admin/add_products', {
                    title : title,
                    desc : desc,
                    price : price,
                    category : category
                });
            }else {
                var atPrice = parseFloat(price).toFixed(2);
                var products = new Product({
                    title : title,
                    desc : desc,
                    price : atPrice,
                    slug : slug,
                    category : category,
                    image : imageFile
                });

                products.save(function(err){
                    if(err)
                        return console.log(err);

                    mkdirp('public/product-images/' + products._id, function(err){
                        return console.log(err);
                    });

                    mkdirp('public/product-images/' + products._id + "/gallery", function(err){
                        return console.log(err);
                    });

                    mkdirp('public/product-images/' + products._id + "/gallery/thumbs", function(err){
                        return console.log(err);
                    })
                    if(imageFile != ""){
                        var productsImage = req.files.image;
                        var path = 'public/product-images/' + products._id + '/' + imageFile;

                        productsImage.mv(path,function(err){
                            return console.log(err);
                        });
                    }
                    req.flash('success', 'products added');
                    res.redirect('/admin/products/');
                });
            }
        });
    }
});
//edit page
router.get('/edit-products/:id',function(req,res){
    var errors;
    if(req.session.errors) 
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function(err, categories){

        Product.findById(req.params.id,function(err,p){
            if(err){
                console.log(err);
                res.redirect('/admin/products/'); 
            }else{
                var galleryDir = 'public/product-images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function(err, files) {
                    if(err){
                        console.log(err);
                    }else{
                        galleryImages = files;

                        res.render('admin/edit_products', {
                            errors : errors,
                            title : p.title,
                            desc : p.desc,
                            category : p.category.replace(/\s+/g,'-').toLowerCase(),
                            categories :categories,
                            price : p.price,
                            image : p.image,
                            galleryImages : galleryImages,
                            id :  p._id
                        });
                    }
                })
            }
        });
    })
});

router.post('/edit-products/:id',function(req,res){

    var imageFile;

    if(!req.files){
        imageFile =""; 
    }
    if(req.files){
        imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
    req.checkBody('title', 'Title have must a value').notEmpty();
    req.checkBody('desc', 'Description have must a value').notEmpty();
    req.checkBody('price', 'Price have must a value').isDecimal();
    req.checkBody('image', 'You must upload is images').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pImage = req.body.pImage;
    var id = req.params.id;
    var errors = req.validationErrors();

    if(errors){
        req.session.errors = errors;
        res.redirect('/admin/products/edit-products/' + id);
    }else {
        Product.findOne({slug : slug, _id : {'$ne' : id }},function(err, p){
            if(err)
                console.log(err);
            
            if(p){
                req.flash('danger','Products title exist, choose another.');
                res.redirect('/admin/products/edit-products/' + id);
                res.render('admin/edit_products', {
                    title : title,
                    desc : desc,
                    price : price,
                    category : category
                });
            }else {
                Product.findById(id, function(err, p){
                    if(err){
                        console.log(err);
                    }
                    p.title = title;
                    p.desc = desc;
                    p.slug = slug;
                    p.price  = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != ""){
                        p.image = imageFile;
                    }

                    p.save(function(err){
                        if(err)
                            console.log(err);

                        if(imageFile != ""){
                            if(pImage != ""){
                                fs.remove('public/product-images/' + id + '/' + pImage, function(err){
                                    if(err)
                                        console.log(err);                        
                                });

                                var productsImage = req.files.image;
                                var path = 'public/product-images/' + id + '/' + imageFile;
        
                                productsImage.mv(path,function(err){
                                    return console.log(err);
                                });
                            }

                            req.flash('success', 'products added');
                           
                            res.redirect('/admin/products/');
                        } 
                    })
                })
            }
        })
    }
});

//delete pages
router.get('/delete-products/:id',function(req,res){
    var id = req.params.id;
    var path = 'public/product-images/' + id;
    fs.remove(path,function(err){
        if(err){
            console.log(err);
        }else{
            Product.findByIdAndRemove(id, function(err){
                if(err)
                    return console.log(err);  
            });
            req.flash('success','Products delete');
            res.redirect('/admin/products/');
        }
    })
});

router.post('/product-galerry/:id',isAdmin,function(req,res){
    var productFile = req.files.file;
    var id = req.params.id;
    var path = 'public/product-images/' + id + '/gallery/' + req.files.file.name;
    var galleryDir = 'public/product-images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productFile.mv(path , function(err, p) {
        if(err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width : 100, height : 100}).then(function(buf){
            fs.writeFileSync(galleryDir ,buf );
        })
    })
    res.sendStatus(200);
});

//delete image
router.get('/delete-image/:image',isAdmin,function(req,res){
    var path = 'public/product-images/' + req.query.id + '/gallery/' + req.params.image;
    var galleryDir = 'public/product-images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    fs.remove(path ,function(err){
        if(err){
            console.log(err);
        }else{
            fs.remove(galleryDir, function(err){
                if(err){
                    console.log(err);
                }else{
                    req.flash('success','Images delete');
                    res.redirect('/admin/products/edit-products/' + req.query.id);
                }
            });
        }
    });
});
module.exports = router;