const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const log = require("./utils/logger");
const config = require("./config");
const errorHandler = require("./api/libs/errorHandler");

mongoose.connect("mongodb://127.0.0.1:27017/sports-tournament");
mongoose.connection.on("error", () => {
  log.error("Fallo la conexion a mongodb");
  process.exit(1);
});
mongoose.set("useFindAndModify", false);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(
  morgan("short", {
    stream: {
      write: (message) => log.info(message.trim()),
    },
  })
);

app.use(errorHandler.procesarErroresDeDB);
if (config.ambiente === "prod") {
  app.use(errorHandler.erroresEnProduccion);
} else {
  app.use(errorHandler.erroresEnDesarrollo);
}

const server = app.listen(config.puerto, () => {
  log.info("Escuchando en el puerto 3000");
});

module.exports = {
  app,
  server,
};
