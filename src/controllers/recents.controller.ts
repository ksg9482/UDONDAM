import { Users } from "../models/users.model";
import { RecentSearchs } from "../models/recentsearchs.model";
import { Request, Response } from 'express';
interface userIdInRequest extends Request {
    userId?: number
}

export const get = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!;
    const userInfo = Users.findById(userId);
    try {
        const recent = await RecentSearchs.findAll({
            attributes: ['id', 'tag', 'notTag'],
            where: {
                userId: userId
            },
            order: [['createAt', 'DESC']],
            limit: 3,
            raw: true
        });
    
        if (!userInfo) {
            return res.status(401).json({ "message": "token doesn't exist" });
        };
    
        if (recent.length === 0) {
            return res.status(200).json(recent);
        };
        
       
        //{ id: 1, tag: '서울특별시,공부,도서관', notTag: null }에서
        //{ id: 1, tag: ['서울특별시','공부','도서관'], notTag: null }로
        const recentForm = RecentSearchs.recentStrToArr(recent);
        
        return res.status(200).json(recentForm);
    } catch (error) {
        return res.status(500).send({"message": "Couldn't Search Recent Tag"});
    }
    
};

export const post = async (req: userIdInRequest, res: Response) => {

    interface IstringTag {
        tag: string;
        notTag: string;
    }

    const userId = req.userId!;
    const { tag, notTag } = req.body;

    const stringTag: IstringTag = {
        tag: tag.join(),
        notTag: notTag ? notTag.join() : null
    };

    //userId 검증
    const userInfo = Users.findById(userId);
    if (!userInfo) {
        return res.status(401).json({ "message": "token doesn't exist" });
    };
    const recent: any = await RecentSearchs.findAll({
        attributes: ['id', 'userId', 'tag', 'notTag'],
        where: {
            userId: userId
        },
        order: ['createAt']
    });

    if (recent.length > 3) {
        await RecentSearchs.destroy({
            where: {
                id: recent[0].id,
            }
        });
    };

    //이미 있다면 삭제해서 최근 검색결과로 업데이트 한다.(생성시간 문제)
    let overlapCheck: any = await RecentSearchs.findOne({
        attributes: ['id'],
        where: {
            tag: stringTag.tag,
            notTag: stringTag.notTag
        }
    });

    try {
        if (overlapCheck) {
            await RecentSearchs.destroy({
                where: {
                    id: overlapCheck.id
                }
            });
        }
        
        await RecentSearchs.create({
            userId: userId,
            tag: stringTag.tag,
            notTag: stringTag.notTag
        });

        return res.status(201).json({ "message": "recentsearch created" });
    } catch (err) {
        return res.status(500).send({"message": "Couldn't Create Recent Tag"});
    }


};