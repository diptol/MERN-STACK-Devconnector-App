const express = require("express");
const router = express.Router();


//@route  GET api/User
//@desc   Test route
//@acess  Public
router.get("/", (req, res) => res.send("User route"));

module.exports = router;
