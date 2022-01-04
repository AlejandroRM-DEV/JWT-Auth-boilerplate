require("dotenv").config();

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use("/api", require("./routes"));

app.listen(4000);
