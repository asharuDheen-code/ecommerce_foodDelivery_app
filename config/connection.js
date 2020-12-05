const mongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};

module.exports.connect = function (done /*its a call back */) {
  const url = "mongodb+srv://swissknife:20lakh@Twoyear@cluster0.d69jt.mongodb.net/swissKnife?retryWrites=true&w=majority";
  const dbname = "newShop";

  mongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};
