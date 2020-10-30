var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const { response } = require("express");

module.exports = {
  addProduct: (product, callback) => {
    console.log(product);
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        // console.log(data.ops[0]._id);
        callback(data.ops[0]._id);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .removeOne({ _id: objectId(prodId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  
  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(proId) },
          {
            $set: {
              name: proDetails.name,
              category: proDetails.category,
              description: proDetails.description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
};
