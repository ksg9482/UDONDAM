require('dotenv').config()
import { sign, verify } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { IUserData, UserSocialType } from '../models/users.model';

interface userIdInRequest extends Request {
  userId?: number
}

const DOMAIN = process.env.DOMAIN || 'localhost';



export const generateAccessToken = (data: any) => {
  return sign(data, process.env.ACCESS_SECRET + "", { expiresIn: "4h" });
};

export const sendAccessToken = (
  res: Response, token: string, userData: IUserData
) => {
  userData = userData || { data: null };

  return res.status(200).cookie("jwt", token, {
    sameSite: 'none',
    domain: DOMAIN,
    path: '/',
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
  }).json({ data: userData });
};

export const isAuthorized = (req: userIdInRequest) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    return null;
  }
  const token = authorization.split(" ")[1];
  try {
    return verify(token, process.env.ACCESS_SECRET + "");
  }
  catch (err) {
    return null;
  };
};

