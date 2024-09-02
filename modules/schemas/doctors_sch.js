//                        MODULE                           //
//=========== defining schema for adding user =============//

const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//============= connecting MongoDB ============//
var OCIMUM_DB = mongoose.createConnection("mongodb://0.0.0.0/OCIMUM", {
  autoIndex: true,
});

const Doctor_ID_schema = new mongoose.Schema({
  Doctor_name: {
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
  token_professional : [
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

  pat_token_evaluator : Number,


  appointments_history : [{
    patient_name : String ,
    symptoms: String,
    patient_token_id : String ,
    operator_token_id : String ,
    app_token_No : Number ,
    application_date : Date ,
    status : String ,
    user_appo_id: String,
    clinic_token_id : String,
    fees_info : {},
    basic_address: String,
    doctor_id: String,
    complition_date : Date,
  }],


  appointments : [{
    patient_name : String ,
    symptoms: String,
    patient_token_id : String ,
    operator_token_id : String ,
    doctor_id: String,
    app_token_No : Number ,
    application_date : Date ,
    status : String ,
    user_appo_id: String,
    clinic_token_id : String,
    fees_info : {},
    basic_address: String,
    available : Boolean,
  }],



  symptoms_presets : [{type : String} ],
  pay_amount_presets : [{type : Number} ],
  joined_Clinic: [{
    clinic_jwt_token : {
      type : String ,
      required:true
    }
  }],

  handler : [{
    type :String,
    required : true
  }],
  verified : Boolean,
  OTP_verified : Boolean,

  sign_up_date : Date,
});

//                MIDDLEWARE                   //
//============ generating token ===============//
Doctor_ID_schema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    console.log("token saved 40");
    return token;
  } catch (error) {
    res.send("schemas/clinic  => 'generateAuthToken'   " + error);
    console.log("schemas/clinic  => 'generateAuthToken'   " + error);
  }
};
Doctor_ID_schema.methods.professionalAuthToken = async function () {
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

//                    MIDDLEWARE                         //
//============ converting passward into hash =============//
Doctor_ID_schema.methods.password_hashing =  async function (next) {
  console.log(this.isModified("password"))
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    // next();
    console.log("ompawaesd;jkfk")
    await this.save();
  }
};

var Doctor = OCIMUM_DB.model("Doctors", Doctor_ID_schema);

//======= Exportin Collection Here =======//
module.exports = { Doctor };
