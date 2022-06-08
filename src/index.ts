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



/*
APP 클래스로 app 객체를 생성할 준비
dbConnection: 데이터베이스 연결 담당
setMiddleWare: 미들웨어 담당. cors, cookieParser 등 포함
getRouting: 라우팅 담당

APP은 서버를 생성하는데 집중하고 listen을 통해 실행한다.
 */
const db = sequelize;

const whiteList = [
    'http://localhost:3000',
    'https://udondam.com',
    'https://udondam-ref.link/'
];
const corsMethods = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];

export class App {
    app: any;
    constructor() {
        this.app = express();
        this.dbConnection();
        //이런 식으로 get, set, ing등을 써도 좋은가?
        this.middleWare();
        this.route();
    };

    dbConnection = async () => {
        await db.authenticate()
        .then(async () => {
            console.log("Connection Success")
        })
        .catch((e) => {
            console.log('TT : ', e);
        });
        //throw new Error('Method not implemented.');
    };

    middleWare = () => {
        this.app.use(cors({
            origin: whiteList,
            credentials: true,
            methods: corsMethods
        }));
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        //throw new Error('Method not implemented.');
    };

    route = () => {
        this.app.use(Api.path, Api.router);
        //throw new Error('Method not implemented.');
    };
};
// 객체지향 준비
export const HOST: string = 'localhost';
export const PORT: number =  8080;

const app = new App().app
app.listen(PORT, HOST, () => {
    console.log(`http://${HOST}:${PORT} 로 실행`)
});
