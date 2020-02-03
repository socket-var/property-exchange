const express = require("express");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const debug = require("debug")("property-exchange:server");

if (process.env.NODE_ENV === "production") {
  require("custom-env").env();
} else {
  require("custom-env").env("development");
}

require("./dbConfig.js");
const authRouter = require("./api/routes/authRouter");
const listingRouter = require("./api/routes/listingRouter");
const agreementRouter = require("./api/routes/agreementRouter");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/agreements", agreementRouter);

app.get("*", function(req, res, next) {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  debug(err.message);
  // render the error page
  res.status(err.status || 500).json({ message: "Internal Server Error" });
});

module.exports = app;
