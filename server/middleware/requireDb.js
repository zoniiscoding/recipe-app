const { isDbConnected } = require("../config/db");

function requireDb(req, res, next) {
  if (!isDbConnected()) {
    return res.status(503).json({
      message:
        "Database is not connected. Start MongoDB locally or set MONGO_URI in server/.env to a MongoDB Atlas URL, then restart the server.",
    });
  }
  next();
}

module.exports = requireDb;
