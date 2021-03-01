const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt =require("bcryptjs");
const config = require("config");
const {
  check,
  validationResult
} = require('express-validator');
//@route  GET api/auth
//@desc   Register route
//@acess  Public

router.get("/", auth, async (req, res) =>{

try{
  const user = await User.findById(req.user.id).select("-password"); //the select option escapes sending back the password
  res.json(user);
} catch (err){
console.error(err.message);
res.status(500).send("server error");
}

});

//@route POST api/auth
//@desc Login user
//@access Pulic
router.post("/",
  // use express validator to validate inputs
    check("email", "Please include a valid email address").isEmail(),
    check("password", "A password is required").exists(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      email,
      password
    } = req.body;



    try {
      //Does the user exist
      let user = await User.findOne({
        email
      });
      if (!user) {

        return res.status(400).json({
          errors: [{
            msg: "Invalid credentials"
          }]
        });
      }

const isMatch = bcrypt.compare(password, user.password);

if(!isMatch){
    return res.status(400).json({msg:"Invalid credentials"});
}

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
