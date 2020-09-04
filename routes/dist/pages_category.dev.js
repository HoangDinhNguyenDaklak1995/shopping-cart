"use strict";

var express = require("express");

var router = express.Router();

var Category = require("../models/category");

router.get('/', function (req, res) {
  Category.find(function (err, categories) {
    if (err) return console.log(err);
    res.render("admin/category", {
      categories: categories
    });
  });
});
router.get('/add-categories', function (req, res) {
  var title = '';
  res.render('admin/add_category', {
    title: title
  });
});
router.post('/add-categories', function (req, res) {
  req.checkBody('title', 'Title have must a value').notEmpty();
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_category', {
      errors: errors,
      title: title
    });
  } else {
    Category.findOne({
      slug: slug
    }, function (err, category) {
      if (category) {
        req.flash('danger', 'Category title exist, choose another.');
        res.render('admin/add_category', {
          title: title,
          slug: slug
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug
        });
        category.save(function (err) {
          if (err) return console.log(err);
          Category.find(function (err, categories) {
            if (err) return console.log(err);else req.app.locals.categories = categories;
          });
          req.flash('success', 'Categories added');
          res.redirect('/admin/category/');
        });
      }
    });
  }
}); //edit page

router.get('/edit-categories/:id', function (req, res) {
  Category.findById(req.params.id, function (err, category) {
    if (err) return console.log(err);
    res.render('admin/edit_category', {
      title: category.title,
      id: category._id
    });
  });
});
router.post('/edit-categories/:id', function (req, res) {
  req.checkBody('title', 'Title have must a value').notEmpty();
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit_category', {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    Category.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, function (err, category) {
      if (category) {
        req.flash('danger', 'Category title exist, choose another.');
        res.render('admin/edit_category', {
          title: title,
          slug: slug,
          id: id
        });
      } else {
        Category.findById(id, function (err, category) {
          if (err) return console.log(err);
          category.title = title, category.slug = slug;
          category.save(function (err) {
            if (err) return console.log(err);
            Category.find(function (err, categories) {
              if (err) return console.log(err);else req.app.locals.categories = categories;
            });
            req.flash('success', 'Page added');
            res.redirect('/admin/category/');
          });
        });
      }
    });
  }
}); //delete pages

router.get('/delete-categories/:id', function (req, res) {
  Category.findByIdAndRemove(req.params.id, function (err) {
    if (err) return console.log(err);
    Category.find(function (err, categories) {
      if (err) return console.log(err);else req.app.locals.categories = categories;
    });
    req.flash('success', 'Categories delete');
    res.redirect('/admin/category/');
  });
});
module.exports = router;