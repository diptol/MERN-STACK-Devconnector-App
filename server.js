const express = require("express");
const mongoose = require("mongoose");
const connectDB=require("./config/db");



const app= express();
connectDB();

app.get("/", (req,res)=>
res.send("API running")
);

 const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
console.log(`server working on ${PORT}`)
);
