const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const {notFound,errorHandler} = require("./middlewares/errorMiddleware");
const path = require("path");
const mongoose = require("mongoose");
var cors = require("cors");

mongoose.set("strictQuery", false);
dotenv.config();
connectDB();
const app = express();
app.use(cors(
    {
        origin:["http://localhost:3000","https://mern-chat-website.onrender.com"]
    }
));
app.use(express.urlencoded({extended:false}));

// app.use(cors({
//     origin: "https://mern-chat-app-api.onrender.com"
// }))
app.use(express.json()); //to accept json data
app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);
// app.use('/',(req,res)=>{
//     res.json("welcome to the server")
// });


// -------------------Deployment-------------

const __dirname1 = path.resolve();
console.log(__dirname1);

// console.log(path.resolve(__dirname1,"frontend","build","index.html"));
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname1,"/frontend/build")));
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
    })
}else{
    app.get("/",(req,res)=>{
        res.send("API is running successfully");
    })
}

// -------------------Deployment-------------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log(`Server started on PORT ${PORT}`.yellow.bold));
const io = require('socket.io')(server,{
    pingTimeout:60000, //the amount of time it will wait while being inactive here it is 60s  so after
                      //60s it will close the connection to save the bandwidth
    cors:{ //it takes cors to avoid cross origin errors while building our app
        origin:"http://localhost:3000",
    },
    
});
io.on("connection",(socket)=>{
    console.log("connected to socket.io");
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        // console.log(userData._id);
        socket.emit("connected");
    });
    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log("user joined room : "+room);
    });
    socket.on('typing',(room)=>socket.in(room).emit("typing"));
    socket.on('stop typing',(room)=>socket.in(room).emit("stop typing"));
    socket.on('new message',(newMessageRecieved)=>{
        var chat = newMessageRecieved.chat;
        if(!chat.users) return console.log("chat.users not defined");
        chat.users.forEach(user=>{
            if(user._id ==newMessageRecieved.sender._id)return;
            socket.in(user._id).emit("message recieved",newMessageRecieved);
        })
    })

    socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});