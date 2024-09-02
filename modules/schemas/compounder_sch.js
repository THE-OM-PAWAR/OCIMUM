//                        MODULE                           //
//=========== defining schema for adding user =============//

const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//============= connecting MongoDB ============//
var OCIMUM_DB = mongoose.createConnection("mongodb://0.0.0.0/OCIMUM", {
  autoIndex: true,
});

const Compounder_ID_schema = new mongoose.Schema({
  //   Clinics_user_name: {
  //     type: String,
  //     required: true,
  //   },
  compounder_name: {
    type: String,
    // unique: true,
    required: true,
  },
  mobile_no:{
    type : Number,
    unique : true ,
    required : true
  },
  password:{
    type : String,
    required : false
  },

  token_professional: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],

  address_presets : [{type : String} ],

  joined_Clinic: [{
    clinic_jwt_token : {
      type : String ,
    }
  }],

  avilable_doctor:[],
  // Address: {
  //   type: String,
  //   required: true,
  // },
  verified : Boolean,
  OTP_verified : Boolean,
  sign_up_date : Date,
});

//                MIDDLEWARE                   //
//============ generating token ===============//
Compounder_ID_schema.methods.generateAuthToken = async function () {
  try {
    
      const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN_KEY);
      this.tokens = this.tokens.concat({ token: token });
    await this.save().then().catch((error)=>{
        console.log(error)
    });
    console.log("token saved 40");
    return token;
  } catch (error) {
    res.send("schemas/clinic  => 'generateAuthToken'   " + error);
    console.log("schemas/clinic  => 'generateAuthToken'   " + error);
  }
};

Compounder_ID_schema.methods.professionalAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN_KEY);
    this.token_professional = this.token_professional.concat({ token: token });
    await this.save();
    console.log("token saved 40");
    return token ;
  } catch (error) {
    res.send("schemas/clinic  => 'generateAuthToken'   " + error);
    console.log("schemas/clinic  => 'generateAuthToken'   " + error);
  }
};

//============ converting passward into hash =============//
Compounder_ID_schema.methods.password_hashing =  async function (next) {
  console.log(this.isModified("password"))
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    // next();
    console.log("ompawaesd;jkfk")
    await this.save();
  }
};

// //                    MIDDLEWARE                         //
// //============ converting passward into hash =============//
// Clinic_schema.pre("save", async function (next) {
//   if (this.isModified("user_passward")) {
//     this.user_passward = await bcrypt.hash(this.user_passward, 10);
//     next();
//   }
// });

var Compounder = OCIMUM_DB.model("Compounders", Compounder_ID_schema);

//======= Exportin Collection Here =======//
module.exports = { Compounder };
