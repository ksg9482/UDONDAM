import { IUserData, IusersAttributes, Users, UserSocialType } from "../models/users.model";
import nodemailer from 'nodemailer';
import { generateAccessToken, sendAccessToken } from '../controllers/token.controller';
import axios from 'axios';
import { Request, Response } from 'express';
import { ErrorMessage } from "./common/errorMessage";
import { AuthEmail, TempPasswordEmail } from "./mail/mailTemplate";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const DOMAIN = process.env.DOMAIN || 'localhost'
const KAKAOID = process.env.EC2_KAKAO_ID || process.env.KAKAO_ID;
const KAKAOSECRET = process.env.EC2_KAKAO_SECRET || process.env.KAKAO_SECRET;
const KAKAOURL = process.env.EC2_KAKAO_REDIRECTURL || process.env.KAKAO_REDIRECTURL;
const CLIENTURI = process.env.EC2_CLINET_URI || process.env.CLIENT_URI;
const NAVERID = process.env.EC2_NAVER_ID || process.env.NAVER_ID;
const NAVERSECRET = process.env.EC2_NAVER_SECRET || process.env.NAVER_SECRET;
const NAVERRIDIRECT = process.env.EC2_NAVER_REDIRECT || process.env.NAVER_REDIRECT


interface userIdInRequest extends Request {
    userId?: number
}

export const serverConnect = async (req: Request, res: Response) => {
    return res.status(200).send("get 응답");
};

export const login = async (req: userIdInRequest, res: Response) => {

    try {
        const { email, password } = req.body;

        const userInfo = await Users.findByEmail(email);
        if (!userInfo) {
            return res.status(401).json({ "message": "Invalid email" });
        };

        const hashedPassword = userInfo.password + ''
        const validPassword = await Users.validPassword(
            password,
            hashedPassword
        );
        if (!validPassword) {
            return res.status(401).json({ "message": "Invalid password" });
        };

        const { id, nickname, area, area2, manager, socialType } = userInfo;

        if (socialType) {
            //socialType이 UserSocialType | undefined로 나오는 문제
            //socialType은 default로 'basic'이 들어가 있기에 정상적이면 undefined가 나오지 않는다
            const userData: IUserData = {
                userId: Number(id),
                nickname: nickname + '',
                area: area + '',
                area2: area2 + '',
                manager: Boolean(manager),
                socialType: socialType
            };
            const token = generateAccessToken(userData);
            // 이 함수에서 토큰과 로그인한 유저의 데이터를 클라이언트로 보낸다
            sendAccessToken(res, token, userData);
        }
    } catch (error) {
        return res.status(401).json({ "message": "Can't Login" });
    }


};

//여기가 문제. 게스트가 고정된 userId를 발급받는다.
export const guest = async (req: userIdInRequest, res: Response) => {
    const userData = {
        userId: 5,
        nickname: '게스트',
        manager: false,
        socialType: UserSocialType.basic,
        area: '인증해주세요',
        area2: '인증해주세요'
    };
    const token = generateAccessToken(userData);
    sendAccessToken(res, token, userData);
};

export const logout = async (req: userIdInRequest, res: Response) => {
    try {
        res.clearCookie('jwt', {
            sameSite: 'none',
            domain: DOMAIN,
            path: '/',
            secure: true,
            httpOnly: true
        }
        );
        return res.status(200).json({ "message": "logout!" });
    }
    catch (err) {
        return res.status(401).json({ "message": "Unauthorized" });
    };
};

export const signup = async (req: userIdInRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        await Users.create({
            email,
            password,
        });
        return res.status(201).json({ "message": "Sign Up!" });
    } catch (error) {
        return res.status(401).json({ "message": "Couldn't create account" });
    }

};

export const email = async (req: userIdInRequest, res: Response) => {
    const { email } = req.body;

    try {
        // 인증코드 생성 함수
        const generateRandomCode = (n: any) => {
            let str = "";
            for (let i = 0; i < n; i++) {
                str += Math.floor(Math.random() * 10);
            };
            return str;
        };

        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
        });

        const verificationCode = generateRandomCode(6);

        // const mailOptions = {
        //     from: `[UDONDAM] <${process.env.NODEMAILER_USER}>`,
        //     to: email,
        //     subject: `[UDONDAM] 이메일 인증번호를 확인해주세요`,
        //     html: `<div style="background-color: white;
        //         display: flex; align-items: center; text-align: center;
        //         flex-direction:column; font-size: 20px;">
        //         <div style="background-size: 58px;
        //         background-color: black;
        //         width: 50rem; min-height: 45rem;
        //         border-radius: 15px 15px 15px 15px;
        //         padding: 2rem;">
        //         <img width="300" alt="로고-우동담-dark-배경o" src="https://user-images.githubusercontent.com/87490361/143793727-047f5764-454d-4b9f-94cd-d82d0f959623.png">
        //         <div style="text-align: left; padding:10px 10px 0;">
        //         <h3 style="text-align: left; color:white;">이메일 인증을 완료하시려면 <b>인증번호</b>를 입력해주세요.</h3>
        //         <h3 style="color:white;">인증번호를 입력하셔야만 이메일 인증이 완료됩니다.</h3>
        //         <h3 style="color:white;">UDONDAM 인증번호 : <u>${verificationCode}</u></h3>
        //         </div></div></div>`,
        // };
        const authEmail = new AuthEmail(email, verificationCode)

        transporter.sendMail(authEmail, (err: any, info: any) => {
            if (err) {
                //console.log(err);
            }
        });
        //이거도 문제. 인증번호를 클라이언트에 전송해서 가지고 있게 하는 자체가 위험하다
        return res.status(200).json({
            "verificationCode": verificationCode
        });
    }
    catch (err) {
        //console.log(err);
        res.sendStatus(500);
    };
};

export const emailCheck = async (req: userIdInRequest, res: Response) => {
    try {
        const { email } = req.body;

        const userInfo = await Users.findByEmail(email);
        if (userInfo) {
            return res.status(409).json({ "message": "Email already exists" });
        }

        return res.status(200).json({ "message": "ok!" });
    } catch (error) {
        return res.status(401).json({ "message": "Couldn't Email Check" });
    }

};

export const passwordCheck = async (req: userIdInRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        const userInfo = await Users.findByEmail(email);

        if (!userInfo) {
            return res.status(401).json({ "message": "Invalid email" });
        };
        const hashedPassword = userInfo.password + ''
        const validPassword = await Users.validPassword(password, hashedPassword);
        if (!validPassword) {
            return res.status(401).json({ "message": "Invalid password" });
        }

        return res.status(200).json({ "message": "ok!" });
    } catch (error) {
        return res.status(401).json({ "message": "Couldn't Password Check" });
    }
};

//nodemailer를 통해 사용자 email로 임시 비밀번호 전송
export const tempp = async (req: userIdInRequest, res: Response) => {
    try {
        const { email } = req.body;

        const userInfo = await Users.findByEmail(email);
        if (!userInfo) {
            return res.status(401).json({ "message": "Invalid email" })
        }

        //nodemailer 연결 모델 생성
        const transporter = nodemailer.createTransport({
            service: process.env.NODEMAILER_SERVICE,
            host: process.env.NODEMAILER_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
        });
        const generateRandomCode = (n: number) => {
            let str = "";
            for (let i = 0; i < n; i++) {
                str += Math.floor(Math.random() * 10);
            }
            return str;
        };
        const verificationCode = generateRandomCode(8);

        const mail = new TempPasswordEmail(email, verificationCode)
        transporter.sendMail(
            mail, (err: Error | null, info: SMTPTransport.SentMessageInfo) => {
                if (err) {
                    return res.status(401).json({ "message": "Couldn't Send Mail" })
                }
            });

        await Users.update({ email: email, password: verificationCode },
            {
                where: {
                    email: email,
                },
            }
        );

        return res.status(200).json({ "message": "resend password!" });

    } catch (error) {
        return res.status(401).json({ "message": "Couldn't Send Temp Password" })
    }

};

export const google = async (req: userIdInRequest, res: Response) => {
    try {
        return res.redirect(
            `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&access_type=offline&response_type=code&state=hello&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&client_id=${process.env.GOOGLE_CLIENT_ID}`
        );
    } catch (err) {
        //console.log(err);
    };
}

export const googlecallback = async (req: userIdInRequest, res: Response) => {
    // authorization code
    const code = req.query.code;

    try {
        const result = await axios.post(
            // authorization code를 이용해서 access token 요청
            `https://oauth2.googleapis.com/token?code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&grant_type=authorization_code`
        );

        const userInfo = await axios.get(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${result.data.access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${result.data.access_token}`,
                },
            }
        );
        const info: any = await Users.findOrCreate({
            where: {
                email: userInfo.data.email,
                socialType: 'google',
            },
            defaults: {
                email: userInfo.data.email,
                password: '',
                socialType: 'google'
            },
        });


        const { id, nickname, area, area2, manager, socialType } = info[0].dataValues;
        const userData = {
            userId: id,
            nickname: nickname,
            area: area,
            area2: area2,
            manager: manager,
            socialType: socialType
        };
        const token = generateAccessToken(userData);

        res.cookie('jwt', token, {
            sameSite: 'none',
            domain: DOMAIN,
            path: '/',
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
        });

        res.redirect(`${process.env.CLIENT_URI}/mypage`);
    } catch (error) {
        res.sendStatus(500);
    };
};

export const naver = (req: userIdInRequest, res: Response) => {
    return res.redirect(
        `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVERID}&state=STATE_STRING&redirect_uri=${NAVERRIDIRECT}`
    );
};

export const naverCallback = async (req: userIdInRequest, res: Response) => {
    const code = req.query.code;
    const state = req.query.state;
    try {
        const result = await axios.post(
            // authorization code를 이용해서 access token 요청
            `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${NAVERID}&client_secret=${NAVERSECRET}&code=${code}&state=${state}`
        );
        const userInfo = await axios.get(
            // access token로 유저정보 요청
            'https://openapi.naver.com/v1/nid/me',
            {
                headers: {
                    Authorization: `Bearer ${result.data.access_token}`,
                },
            }
        );
        //받아온 유저정보로 findOrCreate
        const naverUser = await Users.findOrCreate({
            where: {
                email: userInfo.data.response.email,
                socialType: 'naver',
            },
            defaults: {
                email: userInfo.data.response.email,
                nickname: '익명',
                password: '',
                socialType: 'naver',
                manager: false,
            }
        });


        const userData = generateAccessToken({
            userId: naverUser[0],//.dataValues.id,
            email: naverUser[0],//.dataValues.email,
            nickname: naverUser[0],//.dataValues.nickname,
            socialType: naverUser[0],//.dataValues.socialType,
            manager: naverUser[0]//.dataValues.isAdmin,
        });

        res.cookie('jwt', userData, {
            sameSite: 'none',
            domain: DOMAIN,
            path: '/',
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
        });
        res.redirect(`${process.env.CLIENT_URI}/mypage`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ "message": "Server Error" });
    };
};

export const kakao = async (req: userIdInRequest, res: Response) => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAOID}&redirect_uri=${KAKAOURL}&response_type=code`;
    return res.redirect(kakaoAuthURL);
};

export const kakaoCallback = async (req: userIdInRequest, res: Response) => {
    const code = req.query.code;
    try {
        const result = await axios.post(
            // authorization code를 이용해서 access token 요청
            `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${KAKAOID}&redirect_uri=${KAKAOURL}&code=${code}`
        );
        const userInfo = await axios.get(
            // access token로 유저정보 요청
            'https://kapi.kakao.com/v2/user/me',
            {
                headers: {
                    Authorization: `Bearer ${result.data.access_token}`,
                },
            }
        );
        const email = userInfo.data.kakao_account.email || `${userInfo.data.kakao_account.profile.nickname}@kakao.com`
        //console.log(email)
        const kakaoUser = await Users.findOrCreate({
            where: {
                email: email, socialType: 'kakao'
            },
            defaults: {
                email: email,
                nickname: '익명',
                password: '',
                socialType: 'kakao',
                manager: false,
            },
        });

        //여기 볼것!!
        const userData = generateAccessToken({
            userId: kakaoUser[0],//.dataValues.id,
            nickname: kakaoUser[0],//.dataValues.nickname,
            area: kakaoUser[0],//.dataValues.area,
            area2: kakaoUser[0],//.dataValues.area2,
            socialType: kakaoUser[0],//.dataValues.socialType,
            manager: kakaoUser[0],//.dataValues.manager,
        });
        res.cookie('jwt', userData, {
            sameSite: 'none',
            domain: DOMAIN,
            path: '/',
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 48),
        });
        return res.redirect(`${CLIENTURI}/mypage`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ "message": "Server Error" });
    }
};
