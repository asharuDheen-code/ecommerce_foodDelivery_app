var express = require("express");
const { response } = require("../app");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const { check, validationResult } = require("express-validator");
const { route } = require("./admin");
const dateAndTime = require("date-and-time");
const moment = require("moment");
const pattern = dateAndTime.compile("MMM D YYYY");
var router = express.Router();

const varifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.render("user/userlogin");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  let user = req.session.user;
  let cartCount = null;

  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getAllProducts().then((products) => {
    if (req.session.loggedIn) {
      res.render("user/view-products", { products, user, cartCount });
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
  } else {
    res.render("user/userlogin", {
      loginErr: req.session.loginErr,
      signupsuc: req.session.signupsuc,
    });
    req.session.loginErr = false;
    req.session.signupsuc = false;
  }
});

router.post("/login", (req, res) => {
  userHelpers.dologin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
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
      res.send("already exit");
    }

    // res.render("user/userlogin");
  });
});

router.get("/cart", varifyLogin, async (req, res) => {
  let total = 0;
  let products = await userHelpers.getCartProducts(req.session.user._id);
  cartCount = await userHelpers.getCartCount(req.session.user._id);
  if (products.length != 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("user/cart", {
      products,
      user: req.session.user,
      cartUser: req.session.user._id,
      total,
      cartCount,
    });
  } else {
    res.render("user/cart");
  }
});

router.get("/add-to-cart/:id", (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.post("/delete-one-item", (req, res) => {
  userHelpers.deleteOneCartItem(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.get("/place-order", varifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/place-order", { total, user: req.session.user, cartCount });
});

router.post("/place-order", async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    console.log("its minnnnnnnnnnnnnnnnnnnn", orderId);
    if (req.body["payment-method"] === "COD") {
      res.json({ codSuccess: orderId });
    } else if (req.body["payment-method"] === "RazorPay") {
      userHelpers.generateRazorpay(orderId, totalPrice).then((order) => {
        res.json(order);
      });
    } else if (req.body["payment-method"] === "PayPal") {
      
    }
  });
});
router.post("/verify-payment", (req, res) => {
  let orderId = req.body['order[receipt]']
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: orderId })
    })
  }).catch((err) => {
    console.log(err);
    res.json({status: false})
  })
});

router.get("/order-success/:id", varifyLogin, async (req, res) => {
  let order = await userHelpers.getUserOrder(req.params.id);
  let products = await userHelpers.getSuccessProducts(req.params.id);
  res.render("user/order-success", { user: req.session.user, products, order });
});

router.get("/orders", varifyLogin, async (req, res) => {
  let orders = await userHelpers.getAllOrders(req.session.user._id);
  // orders.date = moment(orders.date, "YYYYMMDD").fromNow();
  // orders.date = dateAndTime.format(orders.date, 'ddd, MMM DD YYYY');
  console.log(orders);
  res.render("user/orders", { user: req.session.user, orders });
});

router.get("/view-order-products/:id", varifyLogin, async (req, res) => {
  // let orders = await userHelpers.getUserOrder(req.session.user._id);
  // let products = await userHelpers.getOrderProducts(req.params.id);
  let order = await userHelpers.getSingleOrder(req.params.id);
  console.log(order);
  // let product = await userHelpers.getCartProducts(req.session.user._id);
  res.render("user/view-order-products", {
    user: req.session.user,
    order,
  });
});

router.get("/profile", (req, res) => {
  userHelpers.getOneUser(req.session.user._id).then((profile) => {
    res.render("user/profile", { user: req.session.user, profile });
  });
});

router.post("/addProfilePic", (req, res) => {
  let id = req.session.user._id;
  let image = req.files.file;
  image.mv("./public/user-images/" + id + ".jpg");
  res.json("response");
});

router.get("/logout", (req, res) => {
  req.session.loggedIn = null;
  res.render("user/userlogin");
});

router.get("/userlogin", (req, res) => {
  res.render("user/userlogin");
});

router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then((orderId) => {
      console.log("aftem paymenttttttttttttttt", orderId);
      res.json({ codSuccess: orderId })
    })
  }).catch((err) => {
    console.log(err);
    res.json({status: false})
  })
});

module.exports = router;
