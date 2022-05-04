require('dotenv').config()
const { sign, verify } = require('jsonwebtoken');
const DOMAIN = process.env.DOMAIN || 'localhost'

module.exports = {
    generateAccessToken: (data:any) => {
        return sign(data, process.env.ACCESS_SECRET, { expiresIn: "4h" });
    },
    sendAccessToken: (res:any, token:any, userData:any) => {
      userData = userData || {data: null};
      res.status(200).cookie("jwt", token,{
        sameSite: 'none',
        domain: DOMAIN,
        path: '/',
        secure: true,
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
      }).json({ data: userData });
      return ;
    },
    isAuthorized: (req:any) => {
        const authorization = req.headers["authorization"];
        if (!authorization) {
          return null;
        }
        const token = authorization.split(" ")[1];
        try {
          return verify(token, process.env.ACCESS_SECRET);
        }
        catch (err) {
          // return null if invalid token
          return null;
        }
    }
};

export = {}