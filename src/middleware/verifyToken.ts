import { Users } from '../models/users.model';
import jwt from 'jsonwebtoken';
require('dotenv').config();

const isAuth = (req:any, res:any, next:any) => {
    //console.log('결과:',req.cookies['jwt'])
    const token = req.cookies['jwt'];
    if (!token) {
        return res.status(401).json({ "message": "token doesn't exist" });
    }
    try {
        jwt.verify(token, process.env.ACCESS_SECRET + "" , async (err:any, encoded:any) => {
            if (err) {
                return res.status(401).json({ "message": "token doesn't exist" });
            };
            
            const usersInfo = await Users.findOne({ where: { id: encoded.userId } });
            if (!usersInfo) {
                return res.status(401).json({ "message": "user doesn't exist" });
            };

            req.userId = encoded.userId;
            return next();
        });
    } catch (error) {
        return res.status(500).json({ "message": "Server Error" });
    }
};

export default isAuth;