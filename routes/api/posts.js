const express = require("express");
const router = express.Router();
const {
  check,
  validationResult
} = require("express-validator");

const db = require("../../config/db");
const Post = require("../../models/post");
const User = require("../../models/User");

const auth = require("../../middleware/auth");

//@route  POST api/posts
//@desc   Add posts
//@acess  Private
router.post("/", [auth, [
  check("text", "Text is required").not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {


    const user = await User.findById(req.user.id).select("-password");
    const newPost = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }
    let post = await Post.findOne({
      user: req.user.id
    });

    post = new Post(newPost);

    post.save();
    res.json(post);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error")
  }

});

//@route  GET api/posts
//@desc   Get all posts
//@acess  Private

router.get("/", auth, async (req, res) => {

  try {
    const posts = await Post.find().sort({
      date: -1
    }); // the sort arranges it and sets it in descending order since it is set as -1
    res.json(posts);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }

});

//@route  GET api/posts/:id
//@desc   Get post by id
//@acess  Private

router.get("/:id", auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id).sort({
      date: -1
    }); // the sort arranges it and sets it in descending order since it is set as -1
    if (!post) {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.json(post);

  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.status(500).send("server error");
  }
});

//@route  DELETE api/posts/:id
//@desc   Delete post by id
//@acess  Private

router.delete("/delete/:id", auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id); // the sort arranges it and sets it in descending order since it is set as -1
    if (!post) return res.status(400).json({
      msg: "post not found"
    });
    //check if the user is the one that posted
    if (req.user.id === post.user.toString()) {
      await post.remove();
      res.json({
        msg: "post removed"
      });
    }
    return res.status(500).send("no permission to delete post");


  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.status(500).send("server error");
  }
});

//@route  PUT api/posts/like/:id
//@desc   like a post by id
//@acess  Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post has been liked by user
    const prevLike = post.likes.filter(item => item.user.toString() === req.user.id).length > 0

    if (prevLike) {
      return res.status(400).json({
        msg: "post already liked by user"
      });
    }
    post.likes.unshift({
      user: req.user.id
    });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.status(500).send("server error");
  }
});

//@route  PUT api/posts/like/:id
//@desc   unlike a post by id
//@acess  Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post has been liked by user
    const prevLike = post.likes.filter(item => item.user.toString() === req.user.id).length > 0

    if (!prevLike) {
      return res.status(400).json({
        msg: "post not yet liked by user"
      });
    }

    //create remove index to remove
    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

    if (removeIndex > -1) {
      post.likes.splice(removeIndex, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.status(500).send("server error");
  }
});


//@route  POST api/comment/:post_id
//@desc   unlike a post by id
//@acess  Private
router.post("/comment/:post_id", [auth, [
  check("text", "Text is required").not().isEmpty()
]], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  try {
    const post = await Post.findById(req.params.post_id);

    const user = await User.findById(req.user.id);

    const comment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }

    post.comments.unshift(comment);

    await post.save();

    res.json(post.comments);


  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.status(500).send("server error");
  }

});

//@route  DELETE api/uncomments/:post_id
//@desc   uncomment a post by id
//@acess  Private
router.delete("/uncomment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    const getComment = await post.comments.filter(item => item._id.toString() === req.params.comment_id);
    if (!getComment) return res.status(400).json({
      msg: "comment do not exist"
    });
    //check if it was the user that posted the comment
    if (post.comments.filter(item => item.user.toString() === req.user.id)) {
      //create removeIndex
      const removeIndex = await post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

      if (removeIndex > -1) {
        post.comments.splice(removeIndex, 1);
      }

      await post.save();
      res.json(post.comments);

    }
    return res.status(400).json({
      msg: "not authorized to delete comment"
    });

  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        msg: "post not found"
      });
    }
    res.status(500).send("server error");
  }
})
module.exports = router;
