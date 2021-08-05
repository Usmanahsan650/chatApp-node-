const express=require('express');
const http=require('http')
const socketio=require('socket.io');
const path = require('path');
const { url } = require('inspector');
const app=express();
const generateMessage=require('./utils/messsage').generateMessage;
const server= http.createServer(app);
const io=socketio(server);
const {addUser,removeUser,getUser,getUsersInRoom}=require("./utils/users");
const { callbackify } = require('util');
const { get } = require('https');
var count=0;

io.on('connection',(socket)=>{
    console.log("connected to socket")
    //socket.emit("joined",generateMessage("Welcome","server"));
    //socket.broadcast.emit('joined',generateMessage('A new user has joined the chat'));
    
    socket.on('join',({username,room},callback)=>{
       const {Error,user}=addUser({id:socket.id,username:username,room:room})
       if(Error){
         return  callback(Error)
       }
     //  console.log(Error)
        socket.join(user.room);
        socket.emit("joined",generateMessage("Welcome to chat room","server"));
        io.to(user.room).emit("getUsers",{users:getUsersInRoom(user.room),room:user.room});       
        socket.broadcast.to(user.room).emit('joined',generateMessage(`${user.username} has joined the room`,"server"));
       callback()
    })
    socket.on('sendMessage',(message,ack)=>{
        const user=getUser(socket.id);
        // console.log(user.username);
        io.to(user.room).emit('recieveIt',generateMessage(message,user.username));
        ack();
    })
    socket.on('sendLocation',(location,ack)=>{
        const user=getUser(socket.id);
        console.log(location);
        const url=`https://www.google.com/maps?q=${location.longitude},${location.latitude}`
        io.to(user.room).emit("getLocation",generateMessage(url,user.username));
        ack();
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        if(user)
        {
        io.to(user.room).emit('left',generateMessage(`${user.username} has left the chat`,"server"));
        io.to(user.room).emit("getUsers",{users:getUsersInRoom(user.room),room:user.room});   
        }   
    });
})
const Port=process.env.PORT ||3000;
app.use(express.static(path.join(__dirname,'../public')))
server.listen(Port,(err)=>{
    console.log("Listening to port "+Port+"!");
})
// app.use('/',homeRouter);