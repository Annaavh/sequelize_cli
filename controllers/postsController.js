const { constants } = require("../constants");
const { postsSchema } = require("../validators/postsValidation");
const {
  VALIDATION_ERROR,
  SERVER_ERROR,
  OK,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
} = constants;
const { Post } = require("../models");
const { Op } = require("sequelize");

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll();
    return res.status(OK).json(posts);
  } catch (err) {
    return res.status(SERVER_ERROR).json({ message: "Internal server error" });
  }
};
const getSinglePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findOne({ where: { id } });
    if (post) {
      res.status(OK).json(post);
    } else {
      return res.status(NOT_FOUND).json({ message: "Post not found !" });
    }
  } catch (error) {
    return res.status(SERVER_ERROR).json(error);
  }
};

const createPost = async (req, res) => {
  try {
    const { error, value } = postsSchema.validate(req.body);
    const { title, description, image } = value;
    if (error) {
      return res
        .status(VALIDATION_ERROR)
        .json({ error: error.details[0].message });
    }
    const user = req.user;
    const newPost = await Post.create({
      user_id: user.id,
      title,
      description,
      image,
    });
    res.status(OK).json(newPost);
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json(error);
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = postsSchema.validate(req.body);
    const { title, description, image } = value;
    if (error) {
      return res
        .status(VALIDATION_ERROR)
        .json({ error: error.details[0].message });
    }
    const result = await Post.update(
      { title, description, image },
      { where: { id } }
    );

    if (result[0]) {
      const updatedPost = await Post.findByPk(id);
      return res
        .status(OK)
        .json({ message: "Post updated successfully !", result: updatedPost });
    } else {
      return res.status(NOT_FOUND).json({ message: "Post not found !" });
    }
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json(error);
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Post.destroy({ where: { id } });
    if (result) {
      return res
        .status(OK)
        .json({ message: "The post has been deleted successfully !" });
    } else {
      return res.status(NOT_FOUND).json({ message: "Post not found !" });
    }
  } catch (err) {
    return res.status(SERVER_ERROR).json(err);
  }
};
const getMyPosts = async (req, res) => {
  const user = req.user;
  const { from, to, title } = req.query;
  const fromDate = from && new Date(from);
  const toDate = to && new Date(to);
  const fromDateTime = fromDate && fromDate.toISOString();
  const toDateTime = toDate && toDate.toISOString();

  try {
    const posts = await Post.findAll({
      where: {
        user_id: user.id,
        [Op.and]: [
          title && {
            title: {
              [Op.like]: `%${title}%`,
            },
          },
          fromDateTime && { createdAt: { [Op.gte]: fromDateTime } },
          toDateTime && { createdAt: { [Op.lte]: toDateTime } },
        ],
      },
    });
    return res.status(OK).json(posts);
  } catch (err) {
    return res.status(SERVER_ERROR).json(err);
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getSinglePost,
  updatePost,
  deletePost,
  getMyPosts,
};
