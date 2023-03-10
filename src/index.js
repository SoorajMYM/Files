const path = require('path')
const express = require("express")
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generatedMessage , generatedLocationMessage } = require('./util/message')
const { addUser, removeUser, getUser , getUserInRoom } = require('./util/users')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

let count = 0

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    console.log("new websocket connected")

    socket.on('join',({id,username, room},callback ) => {

        const {error , user} = addUser({ id : socket.id,username,room})

        if(error){

            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generatedMessage('Admin', 'Welcome !'))
        socket.broadcast.to(user.room).emit('message', generatedMessage('Admin',`${user.username} has joined !`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMesage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed !')
        }
        io.to(user.room).emit('message', generatedMessage(user.username,message))
        callback()
    })
    socket.on('sendLocation', (coords , callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generatedLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generatedMessage('Admin',`${user.username} has left !`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUserInRoom(user.room)
            })
        }

        
    })

    // socket.emit('countUpdateted', count )

    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdateted', count)
    //     io.emit('countUpdateted', count)
    // })
})

server.listen(port, () => {

    console.log('Server started in :' + port)
})

