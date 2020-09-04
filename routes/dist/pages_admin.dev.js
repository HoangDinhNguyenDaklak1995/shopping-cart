"use strict";

var express = require("express");

var router = express.Router();

var Page = require("../models/pages");

router.get('/', function (req, res) {
  res.render("admin/index");
});
router.get('/admin', function (req, res) {
  Page.find({}).sort({
    sorting: 1
  }).exec(function (err, pages) {
    if (err) return console.log(err);
    res.render("admin/show-in", {
      pages: pages
    });
  });
});

function sortPages(ids, callback) {
  var count = 0;

  for (var index = 0; index < ids.length; index++) {
    var id = ids[index];
    count++;

    (function (count) {
      Page.findById(id, function (err, pages) {
        pages.sorting = count;
        pages.save(function (err) {
          if (err) console.log(err);
          ++count;

          if (count >= ids.length) {
            callback();
          }
        });
      });
    })(count);
  }
}

router.post('/reorder-page', function (req, res) {
  var ids = req.body['id[]'];
  sortPages(ids, function () {
    Page.find({}).sort({
      sorting: 1
    }).exec(function (err, pages) {
      if (err) return console.log(err);else req.app.locals.pages = pages;
    });
  });
});
router.get('/add-page', function (req, res) {
  var title = '';
  var slug = '';
  var content = '';
  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });
});
router.post('/add-page', function (req, res) {
  req.checkBody('title', 'Title have must a value').notEmpty();
  req.checkBody('content', 'Content have must a value').notEmpty();
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({
      slug: slug
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exist, choose another.');
        res.render('admin/add_page', {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 1000
        });
        page.save(function (err) {
          if (err) return console.log(err);
          Page.find({}).sort({
            sorting: 1
          }).exec(function (err, pages) {
            if (err) return console.log(err);else req.app.locals.pages = pages;
          });
          req.flash('success', 'Page added');
          res.redirect('/admin/pages/admin');
        });
      }
    });
  }
}); //edit page

router.get('/edit-page/:id', function (req, res) {
  Page.findById(req.params.id, function (err, page) {
    if (err) return console.log(err);
    res.render('admin/edit_page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});
router.post('/edit-page/:id', function (req, res) {
  req.checkBody('title', 'Title have must a value').notEmpty();
  req.checkBody('content', 'Content have must a value').notEmpty();
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.params.id;
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exist, choose another.');
        console.log('Page slug exist, choose another.');
        res.render('admin/edit_page', {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, function (err, page) {
          if (err) return console.log(err);
          page.title = title, page.slug = slug, page.content = content;
          page.save(function (err) {
            if (err) return console.log(err);
            Page.find({}).sort({
              sorting: 1
            }).exec(function (err, pages) {
              if (err) return console.log(err);else req.app.locals.pages = pages;
            });
            req.flash('success', 'Page added');
            res.redirect('/admin/pages/admin/');
          });
        });
      }
    });
  }
}); //delete pages

router.get('/delete-page/:id', function (req, res) {
  Page.findByIdAndRemove(req.params.id, function (err) {
    if (err) return console.log(err);
    Page.find({}).sort({
      sorting: 1
    }).exec(function (err, pages) {
      if (err) return console.log(err);else req.app.locals.pages = pages;
    });
    req.flash('success', 'Page delete');
    res.redirect('/admin/pages/admin');
  });
});
module.exports = router;