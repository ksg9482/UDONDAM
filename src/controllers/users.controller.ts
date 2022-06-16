import { Users } from "../models/users.model";
import { Request, Response } from 'express';
import { SequelizeMethod } from "sequelize/types/utils";
import { areaData } from "./common/area/areaData";
import { areaCheck, areaUpdate } from "./common/area/areaHandle";

interface userIdInRequest extends Request {
    userId?: number
}

export const userInfo = async (req: userIdInRequest, res: Response) => {
    try {
        const userId = req.userId!
        const userInfo = await Users.findById(userId,
            [['id', 'userId'], 'email', 'nickname', 'area', 'area2', 'socialType', 'manager'])

        if (!userInfo) {
            return res.status(404).json({ "message": "UserInfo not Found" });
        };

        return res.status(200).json(userInfo);
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't Search User" });
    };
};

export const userPatch = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!
    const { nickname, password } = req.body;
    const patchInfo = req.body;

    try {
        if (!nickname && !password) {
            return res.status(400).json({ "message": "no data has been sent!" })
        };

        await Users.update(
            patchInfo,
            {
                where: { id: userId }
            });

        if (nickname && password) {
            return res.status(200).json({ "message": "user patched!" })
        };

        const messageOutput = nickname 
        ? { "message": "nickname patched!" } 
        : { "message": "password patched!" };

        return res.status(200).json(messageOutput);
    } catch (err) {
        return res.status(500).json({ "message": "Couldn't Patch Userdata" })
    }
};

export const areaPatch = async (req: userIdInRequest, res: Response) => {
    interface Iarea {
        area?: string;
        area2?: string;
    }

    const userId = req.userId!
    const { area, area2 }: Iarea = req.body;
    const areaObj = req.body;

    try {
        //둘 중 하나만 들어오고 둘 다 없으면 400응답
        if (!area && !area2) {
            return res.status(400).json({ "message": "no data has been sent!" })
        }
        const targetArea = area ? area : area2

        const areaIsTrue = areaCheck(targetArea!);
        if (!areaIsTrue) {
            return res.status(400).json({ "message": "Invalid Area" })
        }
        await areaUpdate(userId, areaObj)

        return res.status(200).json(areaObj)
    } catch (err) {
        return res.status(500).json({ "message": "Couldn't Patch Area" })
    }
};

export const userDelete = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!
    try {
        await Users.destroy({
            where: { id: userId }
        })
        return res.status(200).clearCookie('jwt').json({ "message": 'delete!' })
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't Delete User" });
    }
};

