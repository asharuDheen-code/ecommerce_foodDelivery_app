var db = require("../config/connection");
// var db = require("./");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt"); /* <= bcrypting Password  */
const { response } = require("express");

module.exports = {
  adduser: (userData) => {
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

  // viewProduct: () => {
  //   return new Promise(async (resolve, reject) => {
  //     let allUsers = await db
  //       .get()
  //       .collection(collection.PRODUCT_COLLECTION)
  //       .find()
  //       .toArray();
  //     resolve(products);
  //   });
  // },

  // getAllProducts: () => {
  //   return new Promise(async (resolve, reject) => {
  //     let products = await db
  //       .get()
  //       .collection(collection.PRODUCT_COLLECTION)
  //       .find()
  //       .toArray();
  //     resolve(products);
  //   });
  // },

  viewUser: () => {
    return new Promise(async (resolve, reject) => {
      let allUsers = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(allUsers);
    });
  },

  addUser: (user, callback) => {
    console.log(user);
    db.get()
      .collection("user")
      .insertOne(user)
      .then((data) => {
        // console.log(data.ops[0]._id);
        callback(data.ops[0]._id);
      });
  },

  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) })
        .then((user) => {
          resolve(user);
          console.log(user);
        });
    });
  },

  updateUser: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              username: userDetails.username,
              email: userDetails.email,
              password: userDetails.password,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  updateUsers: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .find({
          $or: [{ username: userDetails.username, email: userDetails.email }],
        })
        .toArray()
        .then((user) => {
          if (user.length != 0) {
            resolve({ statu: null });
          } else {
            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                {
                  $set: {
                    username: userDetails.username,
                    email: userDetails.email,
                  },
                }
              )
              .then((data) => {
                console.log("data.user.ok");
                console.log(data);
                resolve({ status: data.result.ok });
              });
          }
        });
    });
  },

  getUserOrder: () => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },

  changeSuccessOrderStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Your Order Confirme",
            },
          }
        )
        .then(() => {
          resolve(response);
          });
    })
  },

  changeCancelOrderStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Your Order Canceled",
            },
          }
        )
        .then(() => {
          resolve(response);
          });
    })
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
     db.get().collection(collection.USER_COLLECTION).countDocuments().then((response) => {
       resolve(response)
     })
    })
  },

  getAllOrders: () => {
    return new Promise((resolve, reject) => {
     db.get().collection(collection.ORDER_COLLECTION).countDocuments().then((response) => {
       resolve(response)
     })
    })
  },

  getAllProducts: () => {
    return new Promise((resolve, reject) => {
     db.get().collection(collection.PRODUCT_COLLECTION).countDocuments().then((response) => {
       resolve(response)
     })
    })
  },

  getAllDatas: (userDate) => {
    return new Promise((resolve, reject) => {
      let data = db.get().collection(collection.ORDER_COLLECTION)
      .find({date: userDate}).toArray()
      resolve(data)
    })
  }
};
