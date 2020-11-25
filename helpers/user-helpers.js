var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt"); /* <= bcrypting Password  */
const { response } = require("express");
const { CART_COLLECTION } = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const { resolve } = require("path");
let moment = require("moment");
let format2 = "YYYY-MM-DD";
const cucumber = require("@cucumber/cucumber");

var instance = new Razorpay({
  key_id: "rzp_test_CyyEWbJn9u0YOv",
  key_secret: "7e76K20u3k7BDRH2RREMmNiO",
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({ email: userData.email })
        .toArray()
        .then(async (result) => {
          if (result.length != 0) {
            resolve({ status: null });
          } else {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get()
              .collection(collection.USER_COLLECTION)
              .insertOne(userData)
              .then((data) => {
                resolve({ status: data.result.ok });
              });
          }
        });
    });
  },

  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login fialed1");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login fialed2");
        resolve({ status: false });
      }
    });
  },

  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExit = userCart.products.findIndex(
          (product) => product.item == proId
        );
        if (proExit != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 } /* inc increment 💯⏰ */,
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  deleteOneCartItem: (items) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(items.cart) },
          {
            $pull: { products: { item: objectId(items.product) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: {
                "products.$.quantity": details.count,
              },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              // _id: null,
              // total: {$sum: {$multiply: ['$quantity', '$product.price']}},
              _id: "null",
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .toArray();
      console.log(total);
      resolve(total[0].total);
    });
  },

  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let fullDate = moment().format("MMMM Do YYYY, h:mm:ss a");
      let day = moment().format("dddd");
      let time = moment().format("LTS");
      let date = moment().format(format2);

      let status = order.paymentMethod === "COD" ? "placed" : "pending";

      let orderObj = {
        deliveryDetails: {
          firstName: order.fname,
          lastName: order.lname,
          mobile: order.mobile,
          email: order.email,
          address: order.address,
        },
        fulldate: fullDate,
        day: day,
        date: date,
        time: time,
        userId: objectId(order.userId),
        paymentMethod: order.paymentMethod,
        products: products,
        total: total,
        status: status,
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .removeOne({ user: objectId(order.userId) });
          resolve({ id: response.ops[0]._id, amount: response.ops[0].total });
        });
    });
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },
  getUserOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) });

      resolve(orders);
    });
  },
  getAllOrders: (userId) => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .toArray();
      resolve(orders);
    });
  },
  getSingleOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderedItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(orderedItems);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(orderItems);
    });
  },

  getSuccessProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let successItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(successItems);
    });
  },

  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({ _id: objectId(userId) })
        .toArray()
        .then((response) => {
          resolve(response[0]);
        });
    });
  },

  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        resolve(order);
      });
    });
  },

  generatePaypal: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100 * 70, // amount in the smallest currency unit
        currency: "USD",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "7e76K20u3k7BDRH2RREMmNiO");

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if ((hmac = details["payment[razorpay_signature]"])) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve(response);
        });
    });
  },

  getLastOrders: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .sort({ $natural: -1 })
        .limit(3)
        .toArray()
        .then((response) => {
          resolve(response);
        });
      // resolve(response)
    });
  },

  saveAddress: (address) => {
    db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address);
  },

  getAllAddress: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .find()
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  editAddress: (userId, newAddress) => {
    return new Promise((resolve, reject) => {
      console.log("agaiiiiiiiiiiiiiiiiiiiin", newAddress);
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOneAndUpdate(
          { _id: objectId(userId) },
          {
            $set: {
              username: newAddress.name,
              email: newAddress.email,
            },
          }
        )
        .then((response) => {
          db.get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: objectId(userId) })
            .then((responses) => {
              console.log("puthiyathhhhh", responses);
              resolve(responses);
            });
        });
    });
  },

  editAddresses: (userId, newAddress) => {
    return new Promise((resolve, reject) => {
      let address = {
        fname: newAddress.fname,
        lname: newAddress.lname,
        address: newAddress.address,
        mobile: newAddress.mobile,
        email: newAddress.email,
        userId: userId,
      };
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .insertOne(address)
        .then((response) => {
          resolve({ address: response.ops[0] });
        });
    });
  },

  getAllSavedAddresses: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId: id })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
};
