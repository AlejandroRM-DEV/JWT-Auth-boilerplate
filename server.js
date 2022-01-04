require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const app = express();
const helmet = require("helmet");

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use("/api", require("./routes"));

app.listen(4000);
