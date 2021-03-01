const jwt = require ("jsonwebtoken");
const config = require("config");

const ware = (req, res, next) => {
  //Get token from header
  const token = req.header("x-auth-token");

  //check if no jwtToken
  if(!token){
    return res.status(401).json({msg: "No token, authorisation denied"})
  }

  try{
    const decoded = jwt.verify(token, config.get("jwtToken"));

    req.user = decoded.user;
    next();
  } catch(err){
    res.status(401).json({msg: "token is not valid"});
  }
}

module.exports = ware;
