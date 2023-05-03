const { constants } = require("../constants");
const {
  VALIDATION_ERROR,
  SERVER_ERROR,
  OK,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
} = constants;
const { Post } = require("../models");

const permission = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const post = await Post.findOne({ where: { id } });
    if (!post)
      return res.status(NOT_FOUND).json({ message: "Post not found!" });
    if (post.user_id !== user.id) {
      return res.status(FORBIDDEN).json({
        message: "User does not have permission to update or delete!",
      });
    }
    next();
  } catch (err) {
    return res.status(SERVER_ERROR).json(err);
  }
};

module.exports = permission;
