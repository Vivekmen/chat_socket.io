const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const path = require("path");
const server = http.createServer(app);
const io = new Server(server);
const morgan=require("morgan");
const fs=require("fs");

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(morgan("tiny",{ stream: accessLogStream }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});


const users = {};

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("user-connect", (name) => {
    users[socket.id] = name;


    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (message) => {

    io.emit("reciever", { message: message, name: users[socket.id] });

  });

  socket.on('join room',(roomname)=>{
     socket.join(roomname)
  })

  socket.on('room chat',(data,roomname)=>{
    console.log(roomname);
     io.to(roomname).emit('msg',data);
  })
});

server.listen(6200, () => {
  console.log("server is running at http://localhost:6200");
});
