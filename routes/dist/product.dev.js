"use strict";

var express = require("express");

var router = express.Router();

var fs = require('fs-extra');

var Product = require("../models/products");

var Category = require("../models/category");

router.get('/products', function (req, res) {
  Product.find(function (err, products) {
    if (err) console.log(err);
    res.render('all_Product', {
      title: 'All product',
      products: products
    });
  });
});
router.get('/:category', function (req, res) {
  var categoryslug = req.params.category;
  Category.findOne({
    slug: categoryslug
  }, function (err, c) {
    Product.find({
      category: categoryslug
    }, function (err, product) {
      if (err) console.log(err);
      res.render('cat_Product', {
        title: product.title,
        product: product
      });
    });
  });
});
router.get('/:category/:product', function (req, res) {
  var gallerryImage = null;
  Product.findOne({
    slug: req.params.product
  }, function (err, product) {
    if (err) {
      console.log(err);
    } else {
      var galleryDir = 'public/product-images/' + product._id + '/gallery';
      fs.readdir(galleryDir, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          gallerryImage = files;
          res.render('product', {
            title: product.title,
            product: product,
            gallerryImage: gallerryImage
          });
        }
      });
    }
  });
});
module.exports = router;