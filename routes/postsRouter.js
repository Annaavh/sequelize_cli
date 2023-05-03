const express = require("express");
const {
  getAllPosts,
  createPost,
  getSinglePost,
  updatePost,
  deletePost,
  getMyPosts
} = require("../controllers/postsController");
const permission = require("../middlewares/permissions");
const router = express.Router();

router.route("/").get(getAllPosts).post(createPost);
router.route("/myPosts").get(getMyPosts);
router
  .route("/:id")
  .get(getSinglePost)
  .put(permission, updatePost)
  .delete(permission, deletePost);

module.exports = router;
