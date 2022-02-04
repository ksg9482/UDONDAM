const express = require("express")



const userRouter = require('./routers/user')
const postRouter = require('./routers/post')

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();

app.get('/', (req, res)=>{
    res.send('success')
});

app.use('/user', userRouter)
app.use('/post', postRouter)

app.listen(PORT, HOST)
console.log(`http://${HOST}:${PORT}`)