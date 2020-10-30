var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt"); /* <= bcrypting Password  */
const { response } = require("express");

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

            // return new Promise(async (resolve, reject) => {
            //   userData.password = await bcrypt.hash(userData.password, 10);
            //   db.get()
            //     .collection(collection.USER_COLLECTION)
            //     .insertOne(userDetails)
            //     .then((data) => {
            //       resolve({ status: data.result.ok });
            //     });
            // });

            // db.get()
            //   .collection(collection.USER_COLLECTION)
            //   .updateOne(
            //     { _id: objectId(userId) },
            //     {
            //       $set: {
            //         username: userDetails.username,
            //         email: userDetails.email,
            //         // password: userDetails.password,
            //       },
            //     }
            //   )
            //   .then((data) => {
            //     resolve({ status: data.result.ok });
            //   });
          }
        });
    });
  },

  // doSignup: (userData) => {
  //   return new Promise(async (resolve, reject) => {
  //     userData.password = await bcrypt.hash(userData.password, 10);
  //     db.get()
  //       .collection(collection.USER_COLLECTION)
  //       .insertOne(userData)
  //       .then((data) => {
  //         resolve(data.ops[0]);
  //       });
  //   });
  // },

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
};
