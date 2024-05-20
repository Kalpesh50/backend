// const express = require("express");
// const router = new express.Router();
// const userdb = require("../models/userSchema");
// const bcrypt = require("bcryptjs");
// const authenticate = require("../middleware/authenticate");
// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");


// const keysecret = process.env.SECRET_KEY


// // email config

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// })


// // for user registration

// router.post("/register", async (req, res) => {

//     const { fname, lname, phone, email, password, cpassword, photo, sign } = req.body;

//     if (!fname || !lname || !phone || !email || !password || !cpassword || !photo || !sign) {
//         res.status(422).json({ error: "fill all the details" })
//     }

//     try {

//         const preuser = await userdb.findOne({ email: email });

//         if (preuser) {
//             res.status(422).json({ error: "This Email is Already Exist" })
//         } else if (password !== cpassword) {
//             res.status(422).json({ error: "Password and Confirm Password Not Match" })
//         } else {
//             const finalUser = new userdb({
//                 fname, lname, phone, email, password, cpassword, photo, sign
//             });

//             // here password hasing

//             const storeData = await finalUser.save();

//             // console.log(storeData);
//             res.status(201).json({ status: 201, storeData })
//         }

//     } catch (error) {
//         res.status(422).json(error);
//         console.log("catch block error");
//     }

// });


// // user Login

// router.post("/login", async (req, res) => {
//     // console.log(req.body);

//     const { email, password } = req.body;

//     if (!email || !password) {
//         res.status(422).json({ error: "Fill All The Details" })
//     }

//     try {
//         const userValid = await userdb.findOne({ email: email });

//         if (userValid) {

//             const isMatch = await bcrypt.compare(password, userValid.password);

//             if (!isMatch) {
//                 res.status(422).json({ error: "Invalid Credentials" })
//             } else {

//                 // token generate
//                 const token = await userValid.generateAuthtoken();

//                 // cookiegenerate
//                 res.cookie("usercookie", token, {
//                     expires: new Date(Date.now() + 9000000),
//                     httpOnly: true
//                 });

//                 const result = {
//                     userValid,
//                     token
//                 }
//                 res.status(201).json({ status: 201, result })
//             }
//         } else {
//             res.status(401).json({ status: 401, message: "Invalid Credentials" });
//         }

//     } catch (error) {
//         res.status(401).json({ status: 401, error });
//         console.log("catch block");
//     }
// });


// // user valid

// router.get("/validuser", authenticate, async (req, res) => {
//     try {
//         const ValidUserOne = await userdb.findOne({ _id: req.userId });
//         res.status(201).json({ status: 201, ValidUserOne });
//     } catch (error) {
//         res.status(401).json({ status: 401, error });
//     }
// });


// // user logout

// router.get("/logout", authenticate, async (req, res) => {
//     try {
//         req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
//             return curelem.token !== req.token
//         });

//         res.clearCookie("usercookie", { path: "/" });

//         req.rootUser.save();

//         res.status(201).json({ status: 201 })

//     } catch (error) {
//         res.status(401).json({ status: 401, error })
//     }
// });


// // send email Link For reset Password

// router.post("/sendpasswordlink", async (req, res) => {
//     console.log(req.body)

//     const { email } = req.body;

//     if (!email) {
//         res.status(401).json({ status: 401, message: "Enter Your Email" })
//     }

//     try {
//         const userfind = await userdb.findOne({ email: email });

//         // token generate for reset password
//         const token = jwt.sign({ _id: userfind._id }, keysecret, {
//             expiresIn: "120s"
//         });

//         const setusertoken = await userdb.findByIdAndUpdate({ _id: userfind._id }, { verifytoken: token }, { new: true });


//         if (setusertoken) {
//             const mailOptions = {
//                 from: process.env.EMAIL,
//                 to: email,
//                 subject: "Sending Email For password Reset",
//                 text: `This Link is Valid For 2 MINUTES http://localhost:3001/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
//             }

//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.log("error", error);
//                     res.status(401).json({ status: 401, message: "Email Not Send" })
//                 } else {
//                     console.log("Email sent", info.response);
//                     res.status(201).json({ status: 201, message: "Email Sent Succsfully" })
//                 }
//             })

//         }

//     } catch (error) {
//         res.status(401).json({ status: 401, message: "Invalid User" })
//     }

// });


// // verify user for forgot password time

// router.get("/forgotpassword/:id/:token", async (req, res) => {
//     const { id, token } = req.params;

//     try {
//         const validuser = await userdb.findOne({ _id: id, verifytoken: token });

//         const verifyToken = jwt.verify(token, keysecret);

//         console.log(verifyToken)

//         if (validuser && verifyToken._id) {
//             res.status(201).json({ status: 201, validuser })
//         } else {
//             res.status(401).json({ status: 401, message: "User Not Exist" })
//         }

//     } catch (error) {
//         res.status(401).json({ status: 401, error })
//     }
// });


// // change password

// router.post("/:id/:token", async (req, res) => {
//     const { id, token } = req.params;

//     const { password } = req.body;

//     try {
//         const validuser = await userdb.findOne({ _id: id, verifytoken: token });

//         const verifyToken = jwt.verify(token, keysecret);

//         if (validuser && verifyToken._id) {
//             const newpassword = await bcrypt.hash(password, 12);

//             const setnewuserpass = await userdb.findByIdAndUpdate({ _id: id }, { password: newpassword });

//             setnewuserpass.save();
//             res.status(201).json({ status: 201, setnewuserpass })

//         } else {
//             res.status(401).json({ status: 401, message: "User Not Exist" })
//         }
//     } catch (error) {
//         res.status(401).json({ status: 401, error })
//     }
// })



// module.exports = router;


// ****************************************************************************************************

const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const multer = require("multer")
const cloudinary = require('cloudinary').v2;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL; 

          
cloudinary.config({ 
  cloud_name: 'dbkacg1da', 
  api_key: '317533558458912', 
  api_secret: 'rAvQjPdNz4loLmLUV6cSKBBL4kc' 
});

const keysecret = process.env.SECRET_KEY


// email config

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

// multer image code
/**
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'photo') {
            cb(null, 'images/photos')
        } else if (file.fieldname === 'sign') {
            cb(null, 'images/signs')
        } else {
            cb(new Error('Invalid field name'))
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage })
*/




const storage = multer.diskStorage({
    filename: function (req,file,cb) {
      cb(null, file.originalname)
    }
  });
  
  const upload = multer({storage: storage});
  







// for user registration

router.post("/register", upload.fields([{ name: 'photo' }, { name: 'sign' }]), async (req, res) => {
    try {
        const { fname, lname, email, phone, dob, course, batch, gender, nationality, password, cpassword } = req.body;
        let photo = null;
        let sign = null;
        console.log(req.files)
      
        if (req.files && req.files.photo && req.files.photo.length > 0) {
          const photosend = req.files.photo[0].path;
          const photoResult = await cloudinary.uploader.upload(photosend, { folder: 'images/photo' , public_id: req.files.photo[0].originalname});
          photo = photoResult.secure_url;
          
        }
        
        if (req.files && req.files.sign && req.files.sign.length > 0) {
          const signsend = req.files.sign[0].path;
          const signResult = await cloudinary.uploader.upload(signsend, { folder: 'images/sign', public_id: req.files.sign[0].originalname });
          sign = signResult.secure_url;
          
        }
  
        if (!fname || !lname || !email || !phone || !dob || !course || !batch || !gender || !nationality || !password || !cpassword) {
          return res.status(422).json({ error: "Fill all the details" });
        }
  
        const preuser = await userdb.findOne({ email: email });
  
        if (preuser) {
          return res.status(422).json({ error: "This email is already in use" });
        } else if (password !== cpassword) {
          return res.status(422).json({ error: "Password and Confirm Password do not match" });
        }
  
        const finalUser = new userdb({
          fname, lname, email, phone, dob, course, batch, gender, nationality, password, cpassword, photo, sign
        });
  
        // Here password hashing
  
        const storeData = await finalUser.save();
  
        res.status(201).json({ status: 201, storeData });
    } catch (error) {
        console.error("Error in register route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// user Login

router.post("/login", async (req, res) => {
    // console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(422).json({ error: "Fill All The Details" })
    }

    try {
        const userValid = await userdb.findOne({ email: email });

        if (userValid) {

            const isMatch = await bcrypt.compare(password, userValid.password);

            if (!isMatch) {
                res.status(422).json({ error: "Invalid Credentials" })
            } else {

                // token generate
                const token = await userValid.generateAuthtoken();

                // cookiegenerate
                res.cookie("usercookie", token, {
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                });

                const result = {
                    userValid,
                    token
                }
                res.status(201).json({ status: 201, result })
            }
        } else {
            res.status(401).json({ status: 401, message: "Invalid Credentials" });
        }

    } catch (error) {
        res.status(401).json({ status: 401, error });
        console.log("catch block");
    }
});


// user valid

router.get("/validuser", authenticate, async (req, res) => {
    try {
        const ValidUserOne = await userdb.findOne({ _id: req.userId });
        res.status(201).json({ status: 201, ValidUserOne });
    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
});


// user logout

router.get("/logout", authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("usercookie", { path: "/" });

        req.rootUser.save();

        res.status(201).json({ status: 201 })

    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
});


// send email Link For reset Password

router.post("/sendpasswordlink", async (req, res) => {
    console.log(req.body)

    const { email } = req.body;

    if (!email) {
        res.status(401).json({ status: 401, message: "Enter Your Email" })
    }

    try {
        const userfind = await userdb.findOne({ email: email });

        // token generate for reset password
        const token = jwt.sign({ _id: userfind._id }, keysecret, {
            expiresIn: "120s"
        });

        const setusertoken = await userdb.findByIdAndUpdate({ _id: userfind._id }, { verifytoken: token }, { new: true });


        if (setusertoken) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Sending Email For password Reset",
                text: `This Link is Valid For 2 MINUTES ${FRONTEND_URL}forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("error", error);
                    res.status(401).json({ status: 401, message: "Email Not Send" })
                } else {
                    console.log("Email sent", info.response);
                    res.status(201).json({ status: 201, message: "Email Sent Succsfully" })
                }
            })

        }

    } catch (error) {
        res.status(401).json({ status: 401, message: "Invalid User" })
    }

});


// verify user for forgot password time

router.get("/forgotpassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;

    try {
        const validuser = await userdb.findOne({ _id: id, verifytoken: token });

        const verifyToken = jwt.verify(token, keysecret);

        console.log(verifyToken)

        if (validuser && verifyToken._id) {
            res.status(201).json({ status: 201, validuser })
        } else {
            res.status(401).json({ status: 401, message: "User Not Exist" })
        }

    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
});


// change password

router.post("/:id/:token", async (req, res) => {
    const { id, token } = req.params;

    const { password } = req.body;

    try {
        const validuser = await userdb.findOne({ _id: id, verifytoken: token });

        const verifyToken = jwt.verify(token, keysecret);

        if (validuser && verifyToken._id) {
            const newpassword = await bcrypt.hash(password, 12);

            const setnewuserpass = await userdb.findByIdAndUpdate({ _id: id }, { password: newpassword });

            setnewuserpass.save();
            res.status(201).json({ status: 201, setnewuserpass })

        } else {
            res.status(401).json({ status: 401, message: "User Not Exist" })
        }
    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
})

module.exports = router;
