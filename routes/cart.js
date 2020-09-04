const express = require("express");
const router = express.Router();
const Product = require('../models/products');

router.get('/add/:product', function (req, res) {
    var slug = req.params.product;
    Product.findOne({ slug: slug}, function (err, p) {
        if (err)
            return console.log(err);

        if (typeof req.session.cart == 'undefined') {
            req.session.cart = [];
            req.session.cart.push({
                title : slug,
                qty : 1,
                price : parseFloat(p.price).toFixed(2),
                image : '/static/product-images/' + p._id + "/" + p.image ,
            });
        } else {
            var cart = req.session.cart;
            var newItemCart = true;

            for (let i = 0; i < cart.length; i++) {
                if(cart[i].title == slug){
                    cart[i].qty++;
                    newItemCart = false;
                }
            }
            if(newItemCart){
                cart.push({
                    title : slug,
                    qty : 1,
                    price : parseFloat(p.price).toFixed(2),
                    image : '/static/product-images/' + p._id + "/" + p.image ,
                });
            }
        }
        req.flash('success','Product add');
        res.redirect('back');
    })
});

router.get('/checkout', function (req, res) {

    if(req.session.cart && req.session.cart.length == 0){
        delete req.session.cart;
        res.redirect('/cart/checkout');
    }else {
        res.render('checkout',{
            title : 'Checkout',
            cart : req.session.cart
        })
    }
});

router.get('/update/:product', function (req, res) {
    var slug  = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var index = 0; index < cart.length; index++) {
        if(cart[index].title == slug){
            console.log(action);
            switch(action){
                case "add":
                    cart[index].qty++;
                    break;
                case "remove":
                    cart[index].qty--;
                    if(cart[index].qty < 1)  cart.splice(index, 1);
                    break;
                case "clear":
                    cart.splice(index, 1);
                    if(cart.length == 0) 
                        delete req.session.cart;
                    break;
                default :
                    console.log('update problem');
                    break;
            }
            break;
        }  
    }
    req.flash('success','Cart update!');
    res.redirect('/cart/checkout');
});

router.get('/clear', function (req, res) {
    delete req.session.cart;
    req.flash('success','Cart clear!');
    res.redirect('/cart/checkout');
});


router.get('/buynow', function (req, res) {
    delete req.session.cart;
    
    res.sendStatus(200);
});


module.exports = router;