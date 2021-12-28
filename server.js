require("dotenv").config();

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/api", require("./routes"));

app.listen(4000);
