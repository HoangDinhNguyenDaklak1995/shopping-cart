"use strict";

var express = require("express");

var router = express.Router();

var Page = require("../models/pages");

var Product = require('../models/products');

var Category = require("../models/category");

var _require = require('../routes/pages_products'),
    products = _require.products;

router.get('/', function (req, res) {
  Page.findOne({
    slug: 'home'
  }, function (err, page) {
    Category.find(function (err, Category) {
      Product.find(function (err, product) {
        if (err) return console.log(err);
        res.render('index', {
          page: page,
          product: product,
          Category: Category
        });
      });
    });
  });
});
router.get('/:slug', function (req, res) {
  var slug = req.params.slug;
  Page.findOne({
    slug: slug
  }, function (err, page) {
    if (err) console.log(err);

    if (!page) {
      res.redirect('/');
    } else {
      res.render('index', {
        title: page.title,
        content: page.content
      });
    }
  });
});
module.exports = router;