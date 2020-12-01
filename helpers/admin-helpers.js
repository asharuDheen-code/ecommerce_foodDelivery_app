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
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Order Confirme",
            },
          }
        )
        .then(() => {
          resolve(response);
        });
    });
  },

  changeCancelOrderStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Order Canceled",
            },
          }
        )
        .then(() => {
          resolve(response);
        });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .countDocuments()
        .then((response) => {
          resolve(response);
        });
    });
  },

  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments()
        .then((response) => {
          resolve(response);
        });
    });
  },

  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .countDocuments()
        .then((response) => {
          resolve(response);
        });
    });
  },

  getAllDatas: (userDate) => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ date: userDate })
        .toArray();
      resolve(data);
    });
  },

  addCategory: (category) => {
    let categorys = category.category;
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({ category: categorys })
        .toArray()
        .then(async (data) => {
          if (data.length != 0) {
            resolve();
          } else {
            await db
              .get()
              .collection(collection.CATEGORY_COLLECTION)
              .insertOne(category)
              .then((value) => {
                resolve();
              });
          }
        });
    });
  },

  getCategory: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  editCategory: (id, catDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOneAndUpdate(
          { _id: objectId(id) },
          {
            $set: {
              category: catDetails.category,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  getEditCategory: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((result) => {
          resolve(result);
        });
    });
  },

  deleteCat: (id) => {
    return new Promise((resolve, response) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .removeOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  orderData: (twoDates) => {
    firstDate = twoDates.firstDate;
    secondDate = twoDates.secondDate;
    let date = "2020-11-21";
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              date: {
                $gte: firstDate,
                $lte: secondDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              datas: {
                $push: {
                  firstName: "$deliveryDetails.firstName",
                  lastName: "$deliveryDetails.lastName",
                  moile: "$deliveryDetails.moile",
                  email: "$deliveryDetails.email",
                  address: "$deliveryDetails.address",
                  day: "$day",
                  date: "$date",
                  paymentMethod: "$paymentMethod",
                  orderTotal: "$total",
                  status: "$status",
                  orderId: "$_id",
                  userId: "$userId",
                },
              },
              total: { $sum: "$total" },
            },
          },
          {
            $unwind: "$datas",
          },
        ])
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  blockUser: (userId) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .findOneAndUpdate(
        { _id: objectId(userId) },
        {
          $set: {
            userBlock: true,
          },
        }
      );
  },

  getWeekly: (needDate) => {
    return new Promise((resolve, reject) => {
      if (needDate == "weekly") {
        var days = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (needDate == "monthly") {
        var days = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (needDate == "yearly") {
        var days = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
      }
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              fulldate: {
                $gt: days,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
              count: { $sum: 1 },
              datas: {
                $push: {
                  orderId: "$_id",
                  firstName: "$deliveryDetails.firstName",
                  lastName: "$deliveryDetails.lastName",
                  mobile: "$deliveryDetails.mobile",
                  email: "$deliveryDetails.email",
                  address: "$deliveryDetails.address",
                  orderTotal: "$total",
                  status: "$status",
                  date: "$date",
                  paymentMethod: "$paymentMethod",
                },
              },
            },
          },
          {
            $unwind: "$datas",
          },
          {
            $project: {
              datas: 1,
              count: 1,
              total: 1,
            },
          },
        ])
        .toArray()
        .then((response) => {
          console.log("weeklyReport", response);
          resolve(response);
        });
    });
  },

  addNewCategory: (category) => {
    let categorys = category.category;
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({ category: categorys })
        .toArray()
        .then(async (data) => {
          if (data.length != 0) {
            resolve();
          } else {
            await db
              .get()
              .collection(collection.CATEGORY_COLLECTION)
              .insertOne(category)
              .then((value) => {
                resolve(value);
              });
          }
        });
    });
  },

  getSuccessOrder: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .find({ status: "Order Confirme" })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  getRejectOrder: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .find({ status: "Order Canceled" })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  getPendingOrder: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .find({ status: "placed" })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  getSuccess: () => {
    return new Promise((resolve, reject) => {
      var days = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              fulldate: {
                $gt: days,
              },
              status: "placed",
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: "$total" },
              data: {
                $push: {
                  orderId: "$_id",
                  firstName: "$deliveryDetails.firstName",
                  day: "$day",
                  date: "$ddate",
                  status: "$status",
                },
              },
            },
          },
          {
            $unwind: "$data",
          },
        ])
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  getCanceled: () => {
    return new Promise((resolve, reject) => {
      var days = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              fulldate: {
                $gt: days,
              },
              status: "Order Canceled",
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              toatal: { $sum: "$total" },
              data: {
                $push: {
                  orderId: "$_id",
                  firstName: "$deliveryDetails.firstName",
                  day: "$day",
                  date: "$ddate",
                  status: "$status",
                },
              },
            },
          },
          {
            $unwind: "$data",
          },
        ])
        .toArray()
        .then((data) => {
          resolve(data);
          console.log("qqqqqqqqqqqqqqqqqqqqqqq", data);
        });
    });
  },
};
