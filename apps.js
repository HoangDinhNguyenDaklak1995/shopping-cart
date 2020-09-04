const express = require("express");
const expressValidator = require('express-validator');
const config = require("config");
const mongoose = require("mongoose");
const path = require('path');
const app = express();
const i18n = require('i18n');
const bodyParser = require("body-parser");
const session = require('express-session');
const flash = require('connect-flash');
app.use(i18n.init);
const fileUpload = require("express-fileupload");
var passport = require('passport');
i18n.configure({
    locales:['en', 'vi'],
    directory: __dirname + '/locales',
    cookie: 'lang',
});
mongoose.connect(config.get("server.mongoose"),{ useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind("Connect error : "));
db.once('open', function(){
    console.log("Connected to MongoDB Successfuly");
});
app.locals.errors = null;
app.set('trust proxy', 1);
//session
app.use(session({
    secret: 'woot',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));
app.use("/static", express.static( __dirname + "/public"));
app.use(flash());
app.use(fileUpload());
// validator middleware
app.use(expressValidator({
    errorFormatter : function(param, msg ,value){
        var namespage = param.split('.'),
        root = namespage.shift(),
        formParam = root;
        while(namespage.length){
            formParam += '['+namespage.shift()+']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    },
    customValidators : {
        isImage : function(value, fileName){
            var extension = (path.extname(fileName)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case  '.png':
                    return '.png';
                default:
                    return false;
            }
        }
    }
}));

// express message 
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("trust proxy", 1);
app.set("views", __dirname + "/apps/views/");
app.set("view engine", "ejs");

var Page = require("./models/pages");
Page.find({}).sort({sorting: 1}).exec(function(err, pages){
    if(err) 
        return console.log(err);
    else
        app.locals.pages = pages;
});

var Category = require("./models/category");
Category.find(function(err, categories){
    if(err) 
        return console.log(err);
    else
        app.locals.categories = categories;
});

app.get('*',function(req,res,next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})

const pages = require("./routes/pages");
const products = require('./routes/product');
const pages_admin = require("./routes/pages_admin");
const pages_Category = require("./routes/pages_category");
const pages_products = require("./routes/pages_products");
const cart = require('./routes/cart');

app.use("/", pages);
app.use('/products', products);
app.use("/admin/pages", pages_admin);
app.use("/admin/category", pages_Category);
app.use("/admin/products", pages_products);
app.use('/cart',cart);

app.use('/change-lang/:lang', (req, res) => { 
    res.cookie('lang', req.params.lang, { maxAge: 900000 });
    res.redirect('back');
});
//static 
var host  = config.get("server.host");
var port = config.get("server.port");

app.listen(port, host, function() {
    console.log(`Server start to Success on port ${port}`);
})