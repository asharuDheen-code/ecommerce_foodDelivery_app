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
    userHelpers.checkUserBlock(req.session.user._id).then((response) => {
      if (response.userBlock != true) {
        next();
      } else {
        req.session.loggedIn = null;
        res.redirect("/logout");
        // res.render("user/userlogin");
      }
    });
  }
};

const checkUser = (req, res, next) => {
  let userId = req.session.user._id;
  userHelpers.checkUser(userId).then((userDetails) => {
    console.log("ddddddddddddddd", us);
  });
};

router.post("/checkUser", (req, res) => {
  let email = req.body;
  console.log("emaillllllllll", email);
  userHelpers.checkUser(email).then((userDetails) => {
    console.log("ddddddddddddddd", userDetails);
  });
});

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
      console.log("loginnnnnnnnnnnnssss", req.session.loggedIn);
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

router.get("/productDtails/:id", varifyLogin, (req, res) => {
  let id = req.params.id;
  productHelpers.getOneProduct(id).then((product) => {
    res.render("user/productMoreDetails", { product, user: req.session.user });
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
    req.session.checkUser = false;
  }
});

router.post("/login", (req, res) => {
  userHelpers.dologin(req.body).then((response) => {
    console.log("sdfsjjjjjjjjjjjj", response);
    if (response.status && response.user.userBlock != true) {
      console.log("ffffffffffffffffffffkeri");
      req.session.loggedIn = true;
      req.session.checkUser = false;
      req.session.user = response.user;
      res.redirect("/");
    } else if (response.status && response.user.userBlock == true) {
      console.log("lllllllllllllllllllllllllkeri");
      req.session.loginErr = "Accound hasbeen blocked !";
      res.redirect("/login");
    } else {
      console.log("ithimmmmmmmmmmmmmmmmm");
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
  let lastOrders = await userHelpers
    .getLastOrders(req.session.user._id)
    .then((address) => {
      res.render("user/place-order", {
        total,
        user: req.session.user,
        cartCount,
        address,
      });
    });
});

router.post("/place-order", async (req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    if (req.body["paymentMethod"] === "COD") {
      res.json({ success: response.id });
    } else if (req.body["paymentMethod"] === "RazorPay") {
      userHelpers
        .generateRazorpay(response.id, response.amount)
        .then((order) => {
          res.json({ Razorpay: order });
        });
    } else if (req.body["paymentMethod"] === "PayPal") {
      res.json({
        Paypal: {
          id: response.id,
          amount: response.amount,
        },
      });
    }
  });
});

router.post("/saveAddress", (req, res) => {
  let address = req.body;
  userHelpers.saveAddress(address);
  console.log("saveAddresssssssss", req.body);
});

router.post("/verify-paypal", (req, res) => {
  let orderId = req.body.orderId;
  userHelpers.changePaymentStatus(orderId).then((response) => {
    res.json({ status: true });
  });
});

router.post("/verify-payment", (req, res) => {
  let payment = req.body.payment;
  let order = req.body.order;
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers
        .changePaymentStatus(req.body["order[receipt]"])
        .then((orderId) => {
          let id = req.body["order[receipt]"];
          res.json({ success: id });
        });
    })
    .catch((err) => {
      res.json({ status: false });
    });
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
  res.render("user/orders", { user: req.session.user, orders });
});

router.get("/view-order-products/:id", varifyLogin, async (req, res) => {
  let order = await userHelpers.getSingleOrder(req.params.id);
  res.render("user/view-order-products", {
    user: req.session.user,
    order,
  });
});

router.get("/test", (req, res) => {
  res.render("admin/test");
});

router.post("/addAddress", varifyLogin, (req, res) => {
  // let userId = req.session.user._id;
  let address = req.body;
  console.log("firstdfsgfsr", address);
  userHelpers.addNewAddress(address).then((data) => {
    res.redirect("/profile");
  });
});

router.post("/editAddress", varifyLogin, (req, res) => {
  let userId = req.session.user._id;
  let newAddress = req.body;
  userHelpers.editAddress(userId, newAddress).then((responses) => {
    res.json(responses);
  });
});

router.get("/profile", varifyLogin, (req, res) => {
  userHelpers
    .getAllSavedAddresses(req.session.user._id)
    .then((allAddresses) => {
      userHelpers.getUser(req.session.user._id).then((profile) => {
        res.render("user/profile", {
          user: req.session.user,
          profile,
          allAddresses,
        });
      });
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

router.get("/nonVegCategory", varifyLogin, async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  productHelpers.nonVegCategories().then((nonVegDatas) => {
    res.render("user/category", {
      nonVegDatas,
      user: req.session.user,
      cartCount,
    });
  });
});

router.get("/vegCategory", varifyLogin, async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  productHelpers.vegCategories().then((vegDatas) => {
    res.render("user/category", {
      vegDatas,
      user: req.session.user,
      cartCount,
    });
  });
});

// OTP Varification

router.post("/checkMobile", (req, res) => {
  let mobileNumber = req.body.mobileNumber;
  userHelpers.checkMobileNumber(mobileNumber).then((details) => {
    res.json(details);
  });
});

router.get("/pickMe", (res, req) => {
  console.log("its fineeeeeeeeeeeeeeeeeeeeeeee");
});

router.post("/callOtp", (req, res) => {
  var request = require("request");
  var options = {
    method: "POST",
    url: "https://d7networks.com/api/verifier/send",
    headers: {
      Authorization: "Token c8c07b4146aaffb1c1901446a6997e334d0b1778",
    },
    formData: {
      mobile: 91 + req.body.mobileNumber,
      sender_id: "SMSINFO",
      message: "Your otp code is {code}",
      expiry: "9000",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    let id = JSON.parse(response.body);
    let otpId = id.otp_id;
    console.log("idddddddonly", id);
    res.json(otpId);
  });
});

router.post("/otpVerify", (req, res) => {
  var request = require("request");
  var options = {
    method: "POST",
    url: "https://d7networks.com/api/verifier/verify",
    headers: {
      Authorization: "Token c8c07b4146aaffb1c1901446a6997e334d0b1778",
    },
    formData: {
      otp_id: req.body.otpId,
      otp_code: req.body.otpNum,
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log("firrrrrrrrrrrrrst", response.body);
    let result = JSON.parse(response.body);
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaha", result);
    if (result.status == "success") {
      userHelpers.getOneUser(req.body.mobileNumber).then((userData) => {
        req.session.loggedIn = true;
        req.session.user = userData;
        res.json({ status: true });
      });
    } else {
      res.json({ status: false, errMsg: result.error });
    }
  });
});
// END OTP Varification

module.exports = router;
