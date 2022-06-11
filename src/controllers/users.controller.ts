import { Users } from "../models/users.model";
import { Request, Response } from 'express';
import { SequelizeMethod } from "sequelize/types/utils";
import { areaData } from "./common/areaData";

interface userIdInRequest extends Request {
    userId?: number
}

export const userInfo = async (req: userIdInRequest, res: Response) => {
    try {
        const userId = req.userId!
        const userInfoChange = await Users.findById(userId)
        //이걸로 바꾸고 어떻게 바꿔서 보내야 하는지 봐야함. 아마 id만 userId로 바꾸면 될듯
        const userInfo = await Users.findOne({
            attributes: [['id', 'userId'], 'email', 'nickname', 'area', 'area2', 'socialType', 'manager'],
            where: { id: req.userId }
        })
        if (!userInfo) {
            return res.status(404).json({ "message": "UserInfo not Found" });
        }
        return res.status(200).json(userInfo);
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't Search User" });
    }
};

export const userPatch = async (req: userIdInRequest, res: Response) => {
    const { nickname, password } = req.body;

    try {
        if (!nickname && !password) {
            return res.status(400).json({ "message": "no data has been sent!" })
        }

        if (nickname && password) {
            await Users.update({
                nickname: nickname,
                password: password
            },
                {
                    where: { id: req.userId }
                })
            return res.status(200).json({ "message": "user patched!" })
        }

        else if (nickname) {
            await Users.update({
                nickname: nickname
            },
                {
                    where: { id: req.userId }
                })
            return res.status(200).json({ "message": "nickname patched!" })
        }

        else if (password) {
            await Users.update({
                password: password
            },
                {
                    where: { id: req.userId }
                })
            return res.status(200).json({ "message": "password patched!" })
        }
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't Patch Userdata" })
    }
};

export const areaPatch = async (req: userIdInRequest, res: Response) => {
    interface Iarea {
        area: string;
        area2: string;
    }
    const { area, area2 }: Iarea = req.body;
    
    try {
        if (!area && !area2) {
            return res.status(400).json({ "message": "no data has been sent!" })
        }
        //area 체크
        const targetArea = area? area : area2;
        const areaCheck = (targetArea:string) => areaData.find((el) => {
            return el === targetArea
        });
        const areaIsTrue = areaCheck(targetArea)? true : false;
        if(!areaIsTrue) {
            return res.status(400).json({ "message": "Invalid Area" })
        }
        //area 체크
        if (area) {
            await Users.update({
                area: area
            },
                {
                    where: {
                        id: req.userId
                    }
                })

            return res.status(200).json({ "message": "Area patched!" })
        }

        else if (area2) {
            await Users.update({
                area2: area2
            },
                {
                    where: {
                        id: req.userId
                    }
                })

            return res.status(200).json({ "message": "Area2 patched!" })
        }

    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't Patch Area" })
    }
};

export const userDelete = async (req: userIdInRequest, res: Response) => {
    try {
        await Users.destroy({
            where: { id: req.userId }
        })
        return res.status(200).clearCookie('jwt').json({ "message": 'delete!' })
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't User Delete" });
    }
};

