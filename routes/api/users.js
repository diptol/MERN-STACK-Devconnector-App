const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {
  check,
  validationResult
} = require('express-validator');

const User = require("../../models/User");

//@route  POST api/User
//@desc   Register user
//@acess  Public
router.post("/",
  // use express validator to validate inputs
  [check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Please input a password with a minimum of 6 characters").isLength({
      min: 6
    })
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      password
    } = req.body;



    try {
      //Does the user exist
      let user = await User.findOne({
        email
      });
      if (user) {

        return res.status(400).json({
          errors: [{
            msg: "user already exist"
          }]
        });
      }
      //Get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      //create new user
      user = new User({
        name,
        email,
        password,
        avatar,
      });
      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      //return jsonwebtoken(users login immediately they register)
      const payload = {
        user: {
          id: user.id
        }
      }
      jwt.sign(payload, config.get("jwtToken"), {
        expiresIn: 36000
      }, (err,token) => {
        if (err) throw err;
        return res.json({
          token
        });
      });

      // res.send("User registered");

    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }


  });

module.exports = router;
