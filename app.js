require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const router = require("./routes/router");
const cors = require("cors");
const cookiParser = require("cookie-parser")
const port = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;


// app.get("/",(req,res)=>{
//     res.status(201).json("server created")
// });

app.use(cors({ origin: `${FRONTEND_URL}` }));
app.use('/images', express.static('images'))
app.use(express.json());
app.use(cookiParser());
app.use(router);
app.use(cors());

app.listen(port,()=>{
    console.log(`server start at port no : ${port}`);
})