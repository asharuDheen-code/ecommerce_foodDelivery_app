var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const { response } = require("express");

module.exports = {
  addProduct: (product, callback) => {
    let price = parseFloat(product.price);
    let datas = {...product, price}
    db.get()
      .collection("product")
      .insertOne(datas)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
      resolve(products);
    });
  },

  getOneProduct: (id) => {
    return new Promise((resolve, reject) => {
      let product = db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(id)})
      resolve(product)
      console.log("Productssssssaaantto", product);
    })
  },

  nonVegCategories: () => {
    return new Promise(async (resolve, reject) => {
      let nonVegDatas = await db.get().collection(collection.PRODUCT_COLLECTION).find({category: "NonVeg"}).toArray();
      resolve(nonVegDatas)
    })
  },

  vegCategories: () => {
    return new Promise(async (resolve, reject) => {
      let vegDatas = await db.get().collection(collection.PRODUCT_COLLECTION).find({category: "Veg"}).toArray();
      resolve(vegDatas)
    })
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
