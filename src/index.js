const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUserInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')


app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    
    socket.on('join', ({username, room},callback) => {
        const {error,user} = addUser({id:socket.id, username, room})
        if(error){
            return callback(error)
        }        

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUserInRoom(user.room)
        })
        
        callback()
        // socket.emit, io.emit, socket.v=broadcast.emit
        //io.to.emit, socket.broadcast.to.emit
    })

    socket.on('sendMessage',(message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        socket.emit('messageOwn',generateMessage(user.username,message))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    }) 

    socket.on('sendLocation',(coords ,callback)=>{
        const user = getUser(socket.id)
        socket.emit('locationMessageOwn',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        socket.broadcast.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }

       
    })
})

server.listen(port,()=>{
    console.log("server is set up on port:" + port)
})