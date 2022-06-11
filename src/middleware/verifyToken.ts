import { Users } from '../models/users.model';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
require('dotenv').config();
interface userIdInRequest extends Request {
    userId?:number
}
const isAuth = (req:userIdInRequest, res:Response, next:NextFunction) => {
    
    const token = req.cookies['jwt'];
    if (!token) {
        return res.status(401).json({ "message": "token doesn't exist" });
    }
    try {
        jwt.verify(token, process.env.ACCESS_SECRET + "" , async (err:any, encoded:any) => {
            if (err) {
                return res.status(401).json({ "message": "token doesn't exist" });
            };

            const usersInfo = await Users.findById(encoded.userId)
            //const usersInfo = await Users.findOne({ where: { id: encoded.userId } });
            if (!usersInfo) {
                return res.status(401).json({ "message": "user doesn't exist" });
            };

            req.userId = encoded.userId;
            return next();
        });
    } catch (error) {
        return res.status(500).json({ "message": "Server Error" });
    };
};

export default isAuth;