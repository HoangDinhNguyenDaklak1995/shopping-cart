"use strict";

var mongoose = require("mongoose");

var ProductsSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  }
});
var Product = module.exports = mongoose.model('Product', ProductsSchema);