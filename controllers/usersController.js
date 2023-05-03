const { registerSchema, loginSchema } = require("../validators/userValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Post } = require("../models");
const { constants } = require("../constants.js");
const {
  VALIDATION_ERROR,
  SERVER_ERROR,
  OK,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
} = constants;

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    const { name, email, password } = value;
    if (error) {
      return res
        .status(VALIDATION_ERROR)
        .json({ error: error.details[0].message });
    }
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res
        .status(VALIDATION_ERROR)
        .json({ message: "User has already been registered!" });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res
      .status(OK)
      .json({ message: "User registered successfully!", result: newUser });
  } catch (error) {
    console.log(error, "err");
    return res.status(SERVER_ERROR).json(error);
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    const { email, password } = value;
    if (error) {
      return res
        .status(VALIDATION_ERROR)
        .json({ error: error.details[0].message });
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: "Incorrect Email or Password!" });
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        process.env.ACCESS_TOKEN,
        {
          expiresIn: process.env.JWT_EXPIRES,
        }
      );
      const refreshToken = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        process.env.REFRESH_TOKEN
      );
      res.cookie("refreshToken", refreshToken, {
        maxAge: 90000000,
        httpOnly: true,
      });
      res.cookie("token", token, { maxAge: 90000000 });
      res.status(OK).json({ token, refreshToken });
    }
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json(error);
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken == null) return res.status(UNAUTHORIZED);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) return res.status(FORBIDDEN);

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: process.env.JWT_EXPIRES }
    );
    res.status(OK).json({ token });
  });
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
      include: {
        model: Post,
        attributes: [
          "id",
          "user_id",
          "title",
          "image",
          "description",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { register, login, refreshToken, getAllUsers };
