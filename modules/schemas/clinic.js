//                        MODULE                           //
//=========== defining schema for adding user =============//

const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//============= connecting MongoDB ============//
var OCIMUM_DB = mongoose.createConnection("mongodb://0.0.0.0/OCIMUM", {
  autoIndex: true,
});

const Clinic_schema = new mongoose.Schema({
  //   Clinics_user_name: {
  //     type: String,
  //     required: true,
  //   },
  Clinics_name: {
    type: String,
    // unique: true,
    required: true,
  },
  Location_link: {
    type: String,
    required: true,
    unique: true,
  },
  basic_location: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  Address: {
    type: String,
    required: true,
  },
  doctors: [
    {
      token_id: {
        type: String,
        required: true,
        unique: true,
      },
      handler_jwt_id: {
        type: String,
        unique: true
      },
    },
  ],
  Compounders: [
    {
      token_id: {
        type: String,
        required: true,
        unique: true,
      },
    },
  ],
  Ragistration_Date: Date,
});

//                MIDDLEWARE                   //
//============ generating token ===============//
Clinic_schema.methods.generateAuthToken = async function () {
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

// //                    MIDDLEWARE                         //
// //============ converting passward into hash =============//
// Clinic_schema.pre("save", async function (next) {
//   if (this.isModified("user_passward")) {
//     this.user_passward = await bcrypt.hash(this.user_passward, 10);
//     next();
//   }
// });

var Clinics = OCIMUM_DB.model("Clinics", Clinic_schema);

//======= Exportin Collection Here =======//
module.exports = { Clinics };
