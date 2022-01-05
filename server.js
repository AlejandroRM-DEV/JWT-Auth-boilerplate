require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet());

app.use("/api", require("./routes"));

app.listen(process.env.PORT || 4000);
