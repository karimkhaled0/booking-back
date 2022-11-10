import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import { config } from './config/dev'
import { json, urlencoded } from 'body-parser'
import userRouter from './src/user/user.router'
import { signin, signup, protect } from './utils/auth'
import taskRouter from './src/task/task.router'
import categoryRouter from './src/category/category.router';
import roomRouter from './src/chat-room/chat-room.router'
import * as http from 'http';
import { Server } from 'socket.io'
import { Room } from './src/chat-room/chat-room.model'
// app setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

app.use(cors())
// socket.io config
const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: true
    }
});

io.on('connection', (socket) => {
    let messages;
    let roomId;
    console.log(`Connected: ${socket.id}`);
    socket.on('roomId', async data => {
        roomId = data.roomId;
        console.log(`Worked`);
        messages = await getMesssagesByRoomId(roomId);
        console.log(roomId);

        socket.emit("msg:get", { msg: messages });
    })

    socket.on("msg:post", async (data) => {
        console.log('Work', data)
        let message = {
            author: data.author,
            content: data.content
        }
        let roomId = data.roomId
        await updateRoomMessagesById(roomId, message)
        let haha = await getMesssagesByRoomId(roomId)
        io.emit("msg:get", { msg: haha });
    });

    socket.on('location:get', data => {
        console.log('data: ', data)
        io.emit('location:send', data)
    })
    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`)
    })
});


//body-parser setup
app.use(urlencoded({ extended: true }))
app.use(json())
app.use(morgan('dev'))


//routes
app.get('/', (req, res) => {
    res.send("Hello")
})

app.post('/signup', signup)
app.post('/signin', signin)
app.use('/api', protect)
app.use('/api/chat', roomRouter)
app.use('/api/user', userRouter)
app.use('/api/task', taskRouter)
app.use('/api/category', categoryRouter)



mongoose.connect(config.secrets.dbConnection, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongodb is connected!!")
        server.listen(PORT, () => {
            console.log(`server is runing on port ${PORT}`)
        })
    })
    .catch((e) => console.log(e))


async function getMesssagesByRoomId(id) {
    try {
        const room = await Room.findById({ _id: id })
            .select('messages')
            .lean()
            .exec()
        console.log('room: ', room)
        return room;


    } catch (e) {
        console.error(e)
    }

}

async function updateRoomMessagesById(id, messages) {
    try {
        let lastMessage = messages.content;
        console.log('lastMessage', lastMessage)
        const updatedRoom = await Room.findByIdAndUpdate({ _id: id }, { $push: { messages: messages }, lastMessage: lastMessage }, { new: true })
            .lean()
            .exec()

        if (!updatedRoom) {
            console.error("Error updateing Room Messages!!")
        }



    } catch (e) {
        console.error(e)
    }
}