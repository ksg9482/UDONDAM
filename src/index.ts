import https from 'https';
import * as dotenv from "dotenv";
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routers/user';
import postRouter from './routers/post';
import commentRouter from './routers/comment';
import likesRouter from './routers/likes';
import authRouter from './routers/auth';
import recentRouter from './routers/recent';
import { sequelize } from './models';

dotenv.config();

const HOST:string = 'localhost';
const PORT:number = 8080;

const app = express();
const whiteList = [
    'http://localhost:3000',
    'https://udondam.com', 
    'https://udondam-ref.link/'
]
app.use(cors({
    origin:whiteList,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE' ,'OPTIONS']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get('/', (req:any, res:any)=> {
    res.status(200).send("get 응답")
})

// app.use('/user', userRouter);
// app.use('/post', postRouter);
// app.use('/comment', commentRouter);
// app.use('/likes', likesRouter);
// app.use('/', authRouter);
// app.use('/recent', recentRouter)

let server ;
if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
    server = https
    .createServer(
        {
        key: fs.readFileSync(__dirname + `/` + 'key.pem', 'utf-8'),
        cert: fs.readFileSync(__dirname + `/` + 'cert.pem', 'utf-8'),
        },
        app
    )
    .listen(PORT, HOST, async ()=> {
        console.log(`http://${HOST}:${PORT} 로 실행`)
        //중복. 함수로 빼기
    await sequelize.authenticate()
    .then(async () => {
        console.log("Connection Success")
    })
    .catch((e) => {
        console.log('TT : ', e);
    })
    });
    }
else {
server = app.listen(PORT, HOST, async ()=> {
    console.log(`http://${HOST}:${PORT} 로 실행`)
    await sequelize.authenticate()
    .then(async () => {
        console.log("Connection Success")
    })
    .catch((e) => {
        console.log('TT : ', e);
    })
})
}

export {}