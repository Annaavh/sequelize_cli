const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const usersRouter = require("./routes/usersRouter");
const postsRouter = require("./routes/postsRouter");
const validateToken = require("./middlewares/validateToken");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/users", usersRouter);
app.use("/api/posts", validateToken, postsRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`app is running on ${port} port`));
