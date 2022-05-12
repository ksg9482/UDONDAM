require('dotenv').config()
import { sign, verify } from 'jsonwebtoken';
const DOMAIN = process.env.DOMAIN || 'localhost'

export const generateAccessToken= (data:any) => {
  return sign(data, process.env.ACCESS_SECRET + "", { expiresIn: "4h" });
};

export const sendAccessToken= (res:any, token:any, userData:any) => {
userData = userData || {data: null};
res.status(200).cookie("jwt", token,{
  sameSite: 'none',
  domain: DOMAIN,
  path: '/',
  secure: true, //이거 있어서 postman은 바로 못씀. 옵션을..?
  httpOnly: true,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
}).json({ data: userData });
return ;
};

export const isAuthorized = (req:any) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    return null;
  }
  const token = authorization.split(" ")[1];
  try {
    return verify(token, process.env.ACCESS_SECRET + "");
  }
  catch (err) {
    // return null if invalid token
    return null;
  }
};

