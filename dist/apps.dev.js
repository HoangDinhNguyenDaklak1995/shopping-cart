"use strict";

var express = require("express");

var expressValidator = require('express-validator');

var config = require("config");

var mongoose = require("mongoose");

var path = require('path');

var app = express();

var i18n = require('i18n');

var bodyParser = require("body-parser");

var session = require('express-session');

var flash = require('connect-flash');

app.use(i18n.init);

var fileUpload = require("express-fileupload");

i18n.configure({
  locales: ['en', 'vi'],
  directory: __dirname + '/locales',
  cookie: 'lang'
});
mongoose.connect(config.get("server.mongoose"), {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error', console.error.bind("Connect error : "));
db.once('open', function () {
  console.log("Connected to MongoDB Successfuly");
});
app.locals.errors = null;
app.set('trust proxy', 1); //session

app.use(session({
  secret: 'woot',
  resave: true,
  saveUninitialized: true // cookie: { secure: true }

}));
app.use("/static", express["static"](__dirname + "/public"));
app.use(flash());
app.use(fileUpload()); // validator middleware

app.use(expressValidator({
  errorFormatter: function errorFormatter(param, msg, value) {
    var namespage = param.split('.'),
        root = namespage.shift(),
        formParam = root;

    while (namespage.length) {
      formParam += '[' + namespage.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },
  customValidators: {
    isImage: function isImage(value, fileName) {
      var extension = path.extname(fileName).toLowerCase();

      switch (extension) {
        case '.jpg':
          return '.jpg';

        case '.jpeg':
          return '.jpeg';

        case '.png':
          return '.png';

        default:
          return false;
      }
    }
  }
})); // express message 

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.set("trust proxy", 1);
app.set("views", __dirname + "/apps/views/");
app.set("view engine", "ejs");

var Page = require("./models/pages");

Page.find({}).sort({
  sorting: 1
}).exec(function (err, pages) {
  if (err) return console.log(err);else app.locals.pages = pages;
});

var Category = require("./models/category");

Category.find(function (err, categories) {
  if (err) return console.log(err);else app.locals.categories = categories;
});

var pages = require("./routes/pages");

var products = require('./routes/product');

var pages_admin = require("./routes/pages_admin");

var pages_Category = require("./routes/pages_category");

var pages_products = require("./routes/pages_products");

app.use("/", pages);
app.use('/products', products);
app.use("/admin/pages", pages_admin);
app.use("/admin/category", pages_Category);
app.use("/admin/products", pages_products);
app.use('/change-lang/:lang', function (req, res) {
  res.cookie('lang', req.params.lang, {
    maxAge: 900000
  });
  res.redirect('back');
}); //static 

var host = config.get("server.host");
var port = config.get("server.port");
app.listen(port, host, function () {
  console.log("Server start to Success on port ".concat(port));
});