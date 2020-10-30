var express = require("express");
const { response } = require("../app");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const { check, validationResult } = require('express-validator');
var router = express.Router();

const varifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.render("user/userlogin");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  let user = req.session.user;
  console.log(user);
  productHelpers.getAllProducts().then((products) => {
    // console.log(products);
    if (req.session.loggedIn) {
      res.render("user/view-products", { products, user });
    } else {
      res.render("user/userlogin", {
        loginErr: req.session.loginErr,
        signupsuc: req.session.signupsuc,
      });
      req.session.loginErr = false;
      req.session.signupsuc = false;
    }
  });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
    console.log(login);
  } else {
    res.render("user/userlogin", {
      loginErr: req.session.loginErr,
      signupsuc: req.session.signupsuc,
    });
    req.session.loginErr = false;
    req.session.signupsuc = false;
  }
});

// router.post("/login", (req, res) => {
//   res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
//   res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
//   res.setHeader("Expires", "0");
//   if (req.body.email === email && req.body.password === password) {
//     productHelpers.getAllProducts().then((products) => {
//       req.session.loggedAdmin = true;
//       req.session.user = email;
//       res.render("admin/view-products", { products, admin: true });
//     });
//   } else {
//     userHelpers.dologin(req.body).then((response) => {
//       if (response.status) {
//         req.session.loggedIn = true;
//         req.session.user = response.user;
//         res.redirect("/");
//       } else {
//         req.session.loginErr = "ivalid user or password !";
//         res.redirect("/login");
//       }
//     });
//   }
// });
// router.post(
//   "/login",
//   [
//     check("name").not().isEmpty().withMessage("Name is required"),
//     check("email", "Email is required").isEmail(),
//     check("password", "Password is requried")
//       .isLength({ min: 1 })
//   ],
//   (req, res) => {
//     var errors = validationResult(req).array();
//     if (errors) {
//       req.session.errors = errors;
//       req.session.success = false;
//       res.redirect("/user");
//     } else {
//       req.session.success = true;
//       res.redirect("/user");
//     }
//   }
// );

// router.get("/", function (req, res) {
//   res.render("user", {
//     success: req.body.email,
//     errors: req.body.password,
//   });
//   req.session.errors = null;
// });


router.post("/login", (req, res) => {
  userHelpers.dologin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      console.log("fail");
      req.session.loginErr = "ivalid user or password !";
      res.redirect("/login");
    }
  });
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.signupsuc = true;
      req.session.signupsuc = "signup successfully";
      res.redirect("/login");
    } else {
      console.log("not working");
      res.send("already exit");
    }

    // res.render("user/userlogin");
  });
});

router.get("/cart", varifyLogin, (req, res) => {
  res.render("user/cart");
});

router.get("/logout", (req, res) => {
  req.session.loggedIn = null;
  res.render("user/userlogin");
});

router.get("/userlogin", (req, res) => {
  res.render("user/userlogin");
});

module.exports = router;
