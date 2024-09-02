//                        MODULE                           //
//=========== defining schema for adding user =============//

const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Doctor } = require("./doctors_sch");
const { application } = require("express");

//============= connecting MongoDB ============//
var OCIMUM_DB = mongoose.createConnection("mongodb://0.0.0.0/OCIMUM", {
  autoIndex: true,
});

const user_schema = new mongoose.Schema({

  user_name: {
    type: String,
    //unique: true,
    required: true,
  },
  mobile_no:{
    type : Number,
    unique : true ,

  },
//   password:{
//     type : String,
//     unique : true ,
//   }, 

  appointments : [{
    patient_name  : String , 
    doctor_name : String , 
    doctor_token_id : String , 
    operator_token_id : String , 
    app_token_No : Number , 
    application_date :Date , 
    symptoms: String,
    status : String , 
    dr_appo_id : String, 
    clinic_token_id : String,
    fees_info : {},
    basic_address: String,
    available : Boolean,
    complition_date : Date,
    files : {
      document : [],
    },
  }],

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],

  basic_address : {
    type: String,
    required: true,
  },



  verified : Boolean,
  OTP_verified : Boolean,

  sign_up_date : Date,
});

//                MIDDLEWARE                   //
//============ generating token ===============//
user_schema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    console.log("token saved 40");
    return token;
  } catch (error) {
    // res.send("schemas/clinic  => 'generateAuthToken'   " + error);
    console.log("schemas/clinic  => 'generateAuthToken'   " + error);
  }
};
// user_schema.methods.professionalAuthToken = async function () {
//   try {
//     const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN_KEY);
//     this.token_professional = this.token_professional.concat({ token: token });
//     await this.save();
//     console.log("token saved 40");
//     return token ;
//   } catch (error) {
//     res.send("schemas/clinic  => 'generateAuthToken'   " + error);
//     console.log("schemas/clinic  => 'generateAuthToken'   " + error);
//   }
// };

// //                    MIDDLEWARE                         //
// //============ converting passward into hash =============//
// user_schema.methods.password_hashing =  async function (next) {
//   console.log(this.isModified("password"))
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//     // next();
//     console.log("ompawaesd;jkfk")
//     await this.save();
//   }
// };

var Users = OCIMUM_DB.model("users", user_schema);

//======= Exportin Collection Here =======//
module.exports = { Users };
