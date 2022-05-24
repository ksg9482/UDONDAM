import https from 'https';
import * as dotenv from "dotenv";
import fs from 'fs';
import express, { Errback, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as Api from './routes/routes';

import sequelize from './models';
import { ErrorCallback } from 'typescript';

dotenv.config();

export const HOST: string = 'localhost';
export const PORT: number = 8080;

const app = express();
const whiteList = [
    'http://localhost:3000',
    'https://udondam.com',
    'https://udondam-ref.link/'
];
app.use(cors({
    origin: whiteList,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.status(200).send("get 응답")
});


app.use(Api.path, Api.router);

let server;

if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
    server = https
        .createServer(
            {
                key: fs.readFileSync(__dirname + `/` + 'key.pem', 'utf-8'),
                cert: fs.readFileSync(__dirname + `/` + 'cert.pem', 'utf-8'),
            },
            app
        )
        .listen(PORT, HOST, async () => {
            console.log(`http://${HOST}:${PORT} 로 실행`)
            await sequelize.authenticate()
                .then(async () => {
                    console.log("Connection Success")
                })
                .catch((e) => {
                    console.log('TT : ', e);
                });
        });
} else {
    server = app.listen(PORT, HOST, async () => {
        console.log(`http://${HOST}:${PORT} 로 실행`)
        await sequelize.authenticate()
            .then(async () => {
                console.log("Connection Success")
            })
            .catch((e) => {
                console.log('TT : ', e);
            });
    });
}

export default app;