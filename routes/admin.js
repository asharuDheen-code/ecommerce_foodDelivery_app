const { response } = require("express");
var express = require("express");
const productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var base64ToImage = require("base64-to-image");
const { categories } = require("../helpers/admin-helpers");
const { route, render } = require("../app");

const adminUser = "a";
const adminPassword = "a";

/* GET users listing. */
router.get("/", async function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  if (req.session.loggedAdmin) {
    let allUsers = await adminHelpers.getAllUsers();
    let allOrders = await adminHelpers.getAllOrders();
    let allProducts = await adminHelpers.getAllProducts();
    adminHelpers.getSuccess().then((response) => {
      console.log("hhhhhhhhhhhhhhhhhhhhh", response);
      res.render("admin/dashboard", {
        allUsers,
        allOrders,
        allProducts,
        response,
      });
    });
  } else {
    res.render("admin/adminlogin");
  }
});

router.get("/dashboardData", (req, res) => {
  adminHelpers.getCanceled().then((canceled) => {
    adminHelpers.getSuccess().then((success) => {
      console.log("varunnnnnnnnn", canceled);
      res.json({success: success, canceled: canceled});
    });
  });
});

router.get("/view-users", (req, res) => {
  adminHelpers.viewUser().then((users) => {
    res.render("admin/view-users", { users, admin: true });
  });
});

router.get("/view-product", (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render("admin/view-products", { products, admin: true, search: true });
  });
});

router.get("/add-product", function (req, res) {
  adminHelpers.getCategory().then((response) => {
    res.render("admin/add-product", { admin: true, response });
  });
});

router.post("/add-product", (req, res) => {
  // let image = req.files.file;
  productHelpers.addProduct(req.body, (id) => {
    var base64Str = req.body.imageCropp;
    // console.log(base64Str);
    var path = "./public/product-image/";
    var optionalObj = { fileName: id, type: "jpg" };
    base64ToImage(base64Str, path, optionalObj);
    // let image = req.files.Image;
    res.redirect("/admin/view-product");
  });
});

router.get("/edit-products/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  res.render("admin/edit-products", { product, admin: true });
});

router.post("/edit-products/:id", (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-image/" + req.params.id + ".jpg");
    }
  });
});

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/view-product");
  });
});

// category Management

router.get("/category", (req, res) => {
  adminHelpers.getCategory().then((categories) => {
    res.render("admin/category", { categories, admin: true });
  });
});

router.post("/addNewCategory", (req, res) => {
  let category = req.body;
  adminHelpers.addNewCategory(category).then((response) => {
    res.json(response);
  });
});

router.post("/add", function (req, res) {
  let add = req.body;
  adminHelpers.addCategory(add);
  // res.render("admin/addCategory");
  res.redirect("/admin/category");
});

router.get("/addCategory", function (req, res) {
  adminHelpers.getCategory().then((categories) => {
    console.log("sfdddddddddddddddddddddddsfs", categories);
    res.render("admin/addCategory", { admin: true, categories });
  });
});

router.get("/editCategory/:id", (req, res) => {
  let catId = req.params.id;
  adminHelpers.getEditCategory(catId).then((data) => {
    res.render("admin/editCategory", { data, admin: true });
  });
});

router.post("/editCategorys/:id", (req, res) => {
  let id = req.params.id;
  adminHelpers.editCategory(id, req.body).then((cat) => {
    res.redirect("/admin/category");
  });
});

router.get("/deleteCategory", (req, res) => {
  let id = req.query.id;
  console.log("iddddddddddddddddd", id);
  adminHelpers.deleteCat(id);
  res.redirect("/admin/category");
});

//****************Order Managment****************\\

router.get("/successorder", (req, res) => {
  adminHelpers.getSuccessOrder().then((successOrder) => {
    res.render("admin/successOrders", { admin: true, successOrder });
  });
});

router.get("/rejectorder", (req, res) => {
  adminHelpers.getRejectOrder().then((successOrder) => {
    res.render("admin/successOrders", { admin: true, successOrder });
  });
});

router.get("/pendingorder", (req, res) => {
  adminHelpers.getPendingOrder().then((pendingOrder) => {
    res.render("admin/pendingorders", { admin: true, pendingOrder });
  });
});

//****************END Order Managment****************\\

router.get("/view-users", (req, res) => {
  adminHelpers.viewUser().then((users) => {
    res.render("admin/view-users", { users, admin: true, search: true });
  });
});

router.get("/add-users", function (req, res) {
  res.render("admin/add-users", { admin: true });
});

router.post("/add-users", (req, res) => {
  adminHelpers.adduser(req.body).then((response) => {
    if (response.status) {
      req.session.signupsuc = true;
      req.session.signupsuc = "signup successfully";
      res.send("success");
    } else {
      res.send("already-exist");
    }
  });
});

router.get("/delete-users", (req, res) => {
  let userId = req.query.id;
  adminHelpers.deleteUser(userId).then((response) => {
    res.redirect("/admin/view-users/");
  });
});

router.get("/edit-users/:id", async (req, res) => {
  let user = await adminHelpers.getUserDetails(req.params.id);
  res.render("admin/edit-users", { user, admin: true });
});

router.post("/edit-products/:id", (req, res) => {
  // let id = req.params.id
  // console.log(id);
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-image/" + req.params.id + ".jpg");
    }
  });
});

router.post("/edit-users/:id", (req, res) => {
  // let user = req.params.id;
  adminHelpers.updateUsers(req.params.id, req.body).then((response) => {
    // res.redirect("/admin/view-users/");
    if (response.status) {
      // res.redirect("/admin");
      res.redirect("/admin/view-users");
    } else {
      res.send("already exit");
    }
  });
});

router.get("/order-details", async (req, res) => {
  let orders = await adminHelpers.getUserOrder();
  console.log("orrrrrrrrrrrrderes", orders);
  res.render("admin/view-orders", { orders, admin: true });
});

router.get("/adminlogout", (req, res) => {
  req.session.loggedAdmin = null;
  res.redirect("/admin");
});

router.get("/adminlogin", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  if (req.session.loggedAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/adminlogin");
  }
});

router.post("/adminlogin", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  if (req.body.email === adminUser && req.body.password === adminPassword) {
    req.session.loggedAdmin = true;
    if (req.session.loggedAdmin) {
      res.redirect("/admin");
    } else {
      res.render("admin/adminlogin");
    }
  }
});

router.get("/verify-sucessoOrder/:id", async (req, res) => {
  let orders = await adminHelpers.getUserOrder();
  let orderId = req.params.id;
  adminHelpers.changeSuccessOrderStatus(orderId).then((status) => {
    res.render("admin/view-orders", { orders });
  });
});

router.get("/verify-cancelOrder/:id", async (req, res) => {
  let orders = await adminHelpers.getUserOrder();
  let orderId = req.params.id;
  adminHelpers.changeCancelOrderStatus(orderId).then((status) => {
    res.render("admin/view-orders", { orders });
  });
});

router.get("/dashboard", async (req, res) => {
  let allUsers = await adminHelpers.getAllUsers();
  let allOrders = await adminHelpers.getAllOrders();
  let allProducts = await adminHelpers.getAllProducts();
  res.render("admin/dashboard", { allUsers, allOrders, allProducts });
});

router.get("/report", (req, res) => {
  res.render("admin/report");
});

router.post("/reports", async (req, res) => {
  let date = req.body.date;
  let allDatas = await adminHelpers.getAllDatas(date).then((reports) => {
    console.log("reportssssss", reports);
    // res.render("admin/report", { reports })
    res.json(reports);
  });
  // res.render("admin/report");
});

router.post("/takeReport", (req, res) => {
  let dates = req.body;
  console.log("daatesss", dates);
  adminHelpers.orderData(dates).then((dateReports) => {
    console.log("final daataaaaaaaaas", dateReports);
    res.json(dateReports);
  });
});

router.get("/blockUser/:id", (req, res) => {
  let id = req.params.id;
  adminHelpers.blockUser(id);
});

router.post("/date", (req, res) => {
  if (req.body.date == "weekly") {
    adminHelpers.getWeekly(req.body.date).then((weeklyData) => {
      res.json(weeklyData);
    });
  } else if (req.body.date == "monthly") {
    adminHelpers.getWeekly(req.body.date).then((monthlyData) => {
      res.json(monthlyData);
    });
  } else if (req.body.date == "yearly") {
    adminHelpers.getWeekly(req.body.date).then((yearlyData) => {
      res.json(yearlyData);
    });
  }
});

router.get("/salesreport", (req, res) => {
  res.render("admin/salesReport", { admin: true });
});

router.get("/coupen", (req, res) => {
  adminHelpers.getSuccess().then((response) => {
    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhh", response);
    res.render("admin/voucherManagement", {admin: true  });
  });
});

router.post("/generateCode", (req, res) => {
  adminHelpers.generateCode().then((response) => {
    
  })
})

module.exports = router;
