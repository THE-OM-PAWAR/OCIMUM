const jwt = require("jsonwebtoken");
// const { users } = require('../User_Module');
const cookie = require("cookie");
const { Doctor } = require("../schemas/doctors_sch");
const { Compounder } = require("../schemas/compounder_sch");
const path = require("path");

const socket_auth = async (socket, next) => {
  try {
    const token_obj = cookie.parse(socket.handshake.headers.cookie);
    // console.log(token_obj)
    const token = token_obj.jwt_WORKER;
    const verifyUser = jwt.verify(token, process.env.SECRET_TOKEN_KEY);

    let user = await Compounder.findOne({ _id: verifyUser._id });
    if (user == null) {
      user = await Doctor.findOne({ _id: verifyUser._id });
    }
    const verifyUser2 = jwt.verify(
      user.token_professional[0].token,
      process.env.SECRET_TOKEN_KEY
    );

    if (verifyUser2._id === verifyUser._id) {
        socket.token = token;
        socket.professional = user;
      
      next();
    }

  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = socket_auth;
