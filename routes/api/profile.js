const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const request = require("request");
const config = require("config")
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const {check, validationResult} = require("express-validator");

//@route  GET api/profile/me
//@desc   Get current user profile
//@acess  Public
router.get("/me", auth, async (req, res) =>{

try{
  const profile = await Profile.findOne({user : req.user.id}).populate("user",["name","avatar"]);

if(!profile){
  res.status(400).json({msg:"no profile for this user"})
}
  res.json(profile);

} catch(err){
  console.error(err.message);
  res.status(500).send("Server Error");
}

});


//@route  PST api/profile
//@desc   Create/Update user profile
//@acess  Private
router.post("/",[
  auth, [
    check("status","status is required").not().isEmpty(),
    check("skills", "skills is required").not().isEmpty()
  ]
], async (req,res) =>{
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

//import the post fields ny destructuring

const {
  company, website,location,bio,status, githubusername,skills,youtube,facebook,twitter,instagram,linkedin
} = req.body;

//Build profile object
const profileFields = {};
   profileFields.user=req.user.id;
   if(company) profileFields.company=company;
   if(website) profileFields.website=website;
   if(location) profileFields.location=location;
   if(bio) profileFields.bio=bio;
   if(status) profileFields.status=status;
   if(githubusername) profileFields.githubusername=githubusername;
   if(skills) {
     profileFields.skills = skills.split(",").map(skill => skill.trim()); //the split function converts the skills field object to an array and the map function trims any space or extra character
   }

   //add social object
   profileFields.social = {}

   if (youtube) profileFields.social.youtube = youtube;
   if (twitter) profileFields.social.twitter = twitter;
   if (facebook) profileFields.social.facebook = facebook;
   if (linkedin) profileFields.social.linkedin = linkedin;
   if (instagram) profileFields.social.instagram = instagram;

   //insert the data
   try{
     let profile =await Profile.findOne({user: req.user.id});
     //update
     if(profile){
       profile = await Profile.findOneAndUpdate({user:req.user.id}, {$set:profileFields}, {new:true}).populate("user",["avatar","name"]);
       return res.json(profile);
     }
     //create
     profile = new Profile(profileFields).populate("user",["avatar","name"]);
     await profile.save();
     res.json(profile);
   } catch(err){
     console.error(err.message);
     res.status(500).send("server error");
   }
});

//@route  GET api/profile
//@desc   Get all profiles
//@acess  Public
router.get("/", async (req,res) =>{
try {
  const profiles = await Profile.find().populate("user",["name","avatar"]);
  res.json(profiles);
} catch (err) {
  console.error(err.msg);
  res.status(500).send("server error")
}
});

//@route  GET api/profile/user/:user_id
//@desc   Get all profiles
//@acess  Public
router.get("/user/:user_id", async (req,res) =>{
try {
  const userSearch = req.params.user_id ;

  const profile = await Profile.findOne({user:userSearch}).populate("user",["name","avatar"]);
  if(!profile){
    return res.status(400).json({msg:"Profile not found"});
  } else{
  res.json(profile);
  }
} catch (err) {
  console.error(err.msg);
  if(err.kind == "ObjectId"){
    return res.status(400).json({msg:"Profile not found"});
  }
  res.status(500).send("server error");
}
});

//@route  DELETE api/profile
//@desc   Delete profiles, Users & Posts
//@acess  Private
router.delete("/delete", auth, async (req,res) =>{

  //Remove profile
  await Profile.findOneAndRemove({user:req.body.user});

  //Remove user
  await User.findOneAndRemove({_id:req.body.user});

res.json({msg:"User deleted successfully"});
});

//@route  PUT api/profile/experience
//@desc   Add profile experience
//@acess  Private
//a put request updates part of a profile

router.put("/experience", [auth, [
  check("title", "Title is required").not().isEmpty(),
  check("company", "Company is required").not().isEmpty(),
  check("from", "From date is required").not().isEmpty(),

]], async (req, res) =>{
  const errors= validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400). json({errors: errors.array() });
  }

const {
  title,
  company,
  locaiton,
  from,
  to,
  current,
  description
} = req.body;

const newExp = {
  title,
  company,
  locaiton,
  from,
  to,
  current,
  description
}

  try {
    const profile = await  Profile.findOne({user:req.user.id});
    profile.experience.unshift(newExp);    //unshift or push adds to the fields of an array
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route  PUT api/profile/experience
//@desc   Add profile experience
//@acess  Private
router.delete("/experience/:exp_id", auth, async (req, res) =>{
  try {
    const profile = await Profile.findOne({user:req.user.id});

//create index, this could also be done by filtreing*
const index = profile.experience.map(item => item._id).indexOf(req.params.exp_id);

if(index > -1){
  profile.experience.splice(index, 1);
}

await profile.save();

return res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route  PUT api/profile/education
//@desc   Add education experience
//@acess  Private
router.put("/education", [auth, [
  check("degree", "Degree is required").not().isEmpty(),
  check("school", "School is required").not().isEmpty(),
  check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
  check("from", "from is required").not().isEmpty(),

]], async (req, res) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(400).json({errors : errors.array()});
  };
  const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
      } = req.body;
  const newEd = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
  };

  try {

    const profile = await Profile.findOne({user:req.user.id});

    profile.education.unshift(newEd);

    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route  DELETE api/profile/education/:ed_id
//@desc   delete education
//@acess  Private
router.delete("/education/:ed_id", auth, async (req,res) =>{
try {
  const profile = await Profile.findOne({user:req.user.id});

  // const index = profile.education.map(item => item._id).indexOf(req.params.ed_id);
  //
  // if(index > -1){
  //   profile.education.splice(index, 1);
  // }

  updatedProfile= profile.education.filter((item)=> (item._id.toString() !== req.params.ed_id));

  profile.education = updatedProfile;

  await profile.save();
  return res.json(profile);

} catch (err) {
  console.error(err.message);
  res.status(500).send("server error");
}

});

//@route  GET api/profile/github/:username
//@desc   view github repo for user
//@acess  Public
router.get("/github/:username", (req,res) =>{
try {
  const options = {
    uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubclientID")}&client_secret=${config.get("githubclientSecret")}`,
    method: "GET",
    headers:{"user-agent":"node.js"}
  };

  request(options, (error, response, body) => {
    if(error) console.error(error);

    if (response.statusCode !== 200) {
    return res.status(400).json({msg:"Github profile not found"});
    }

    res.json(JSON.parse(body) );
  })
}catch (err) {
  console.error(err.message);
  res.status(500).send("server error");
}
});

module.exports = router;
