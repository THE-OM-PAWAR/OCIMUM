require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const cookie = require("cookie");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs/dist/bcrypt");
const URL = require("url");
const port = process.env.PORT ;
const fs = require("fs");

// console.log(process.env.ENABLE_SOCKET_SITE)

const io = require("socket.io")(http, {
  maxHttpBufferSize: 1e7 ,// Example: Set limit to 10 MB
  cors: {
    origin: (origin, callback) => {
        // Check if the origin is in the allowedOrigins array
        if (!origin || process.env.ENABLE_SOCKET_SITE.includes(origin)) {
          callback(null, origin); // Allow the connection
        } else {
          callback(new Error("Not allowed by CORS")); // Reject the connection
        }
      } ,
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
  },
  transports: ['websocket', 'polling'],
  enabledTransports: ['ws', 'wss'],
  wsPort: 8080,
});


// const io = require("socket.io")(http, {
//   maxHttpBufferSize: 1e7 ,// Example: Set limit to 10 MB
//   cors: {
//     origin: "https://sanctum.ocimum.in",
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'],
//   enabledTransports: ['ws', 'wss'],
//   wsPort: 8080,
// });


//============= declearing modules ============//
const professionalAuth = require("./modules/authentications/professionalAuth");
const { Users } = require("./modules/schemas/user_sch");
//============= declearing modules ============//

//============= middleware ============//

const corsOptions = {
  origin: 'https://sanctum.ocimum.in',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());


//============= Static file  ============//
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

//============= All pages are here ============//

app.get("/", async (req, res) => {
  try {
    res.sendFile(__dirname + "/public/index1.html");
  } catch (error) {
    res.send(400);
  }
});

io.use(professionalAuth);

io.on("connection", async (socket) => {

    console.log("socket connected .... ");
    
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    
    if (socket.professional) {


        console.log("professional connected");
        


        // all document is now going at the same 
        socket.on("add-document", async ({appointments_object , FileObject})=>{

          try {
            const { image, filename, fileType } = FileObject;
            console.log(`Received image: ${filename} with type ${fileType}`);

            const verifyUser = jwt.verify(
              appointments_object.patient_token_id,
              process.env.SECRET_TOKEN_KEY
            );
      
            let user = await Users.findOne({ _id: verifyUser._id });
  
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            const filePath = await saveUserFile(user._id, "document", buffer, filename);


            if (filePath == false) {
              console.error("file is not saved");
              return
            }else{
              console.log(filePath)
            }

            user.appointments.forEach(element=>{
              if (element._id == appointments_object.user_appo_id) {
                docObject = {
                  filename : filename,
                  fileType : fileType,
                  filePath : filePath.toString(),
                  time : new Date(Date.now())
                }

                // element.files = {}
                
                console.log(element.files)
                if (!element.files) {
                  element.files = {}
                  if (!element.files.document) {
                    element.files.document = []
                  }
                }

                let matched = false
                // if (element.files.document.length > 0) {
                  element.files.document.forEach(element=>{
                    if (element.filename == filename ) {
                      matched = true
                    }
                  })
                // }

                if (matched == false) {
                  element.files.document.push(docObject)
                }

                console.log(element.files)
                
              }
            })
            // console.log(user)
            console.log(user.appointments)

            let updated_value_user = { $set: { appointments: user.appointments } }
            await Users.updateOne({ _id: verifyUser._id }, updated_value_user)


            socket.emit("document-saved-successfully" , appointments_object )
      
          } catch (error) {
            console.log(error)
          }
          

        });

        socket.on("remove-document", async ({appointmentObject , doctor_id , fileObject , patientTokenID})=>{

          try {
            const { filePath, filename, fileType } = fileObject;
            console.log(fileObject)
            const verifyUser = jwt.verify(
              patientTokenID,
              process.env.SECRET_TOKEN_KEY
            );
      
            const query = {  _id: verifyUser._id , "appointments._id": appointmentObject._id };
            const update = {
              $pull: {
                  'appointments.$.files.document': { filename: filename }
              }
            };
   
            const result = await Users.updateOne(query, update);
            console.log(result)

            if (result.modifiedCount > 0) {
                console.log("Document updated successfully");
            } else {
                console.log("No document matched the query or no changes made");
            }

            deleteFile(filePath)

            socket.emit("document-deleted-successfully" , appointmentObject , doctor_id )
      
          } catch (error) {
            console.log(error)
          }
          
        });


        socket.on("send-appointment-document" , async data=>{
          try {
            const verifyUser = jwt.verify(
              data.patient_token_id,
              process.env.SECRET_TOKEN_KEY
            );

            let user = await Users.findOne({ _id: verifyUser._id });

            user.appointments.forEach(element=>{
              if (element._id == data.user_appo_id) {

                socket.emit("take-appointment-document" , element , data )
                
              }
            })
            
            
          } catch (error) {
            console.log(error)
          }
        })
    
    }
})


//============= Server Listning here ============//
http.listen(port, "0.0.0.0", () => {
    console.log(`the app is runing at port http://localhost:${port}`);
});


  

async function saveUserFile(userId, fileCategory , fileBuffer, fileName) {
  try {

      const userIdStr = userId.toString()
      // Construct the directory path
      const userDir = path.join(__dirname, 'public/uploads', 'users', userIdStr, fileCategory);
      // Create directories if they don't exist
      await fs.promises.mkdir(userDir, { recursive: true });
      // Construct the full file path
      let filePath = path.join(userDir, fileName);
      // Write the file to the filesystem
      await fs.promises.writeFile(filePath, fileBuffer);

      filePath = filePath.replace(/\\/g, '/');
      console.log(filePath)
      return filePath;
  } catch (error) {
      console.error('Error saving the file:', error);
      throw new Error('File could not be saved');
  }
}


function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
      const parts = filePath.split('public');
      // The part after "public"
      const trimmedPath = parts[1];
      // The new path
      const newPath = path.join(__dirname, 'public', trimmedPath);

      console.log(newPath);
      fs.unlink(newPath, (err) => {
          if (err) {
              console.error(`Error deleting file: ${err.message}`);
              reject(err);  // Pass the error to the promise rejection
          } else {
              console.log(`File deleted: ${newPath}`);
              resolve();  // Resolve the promise when deletion is successful
          }
      });
  });
}
  
  