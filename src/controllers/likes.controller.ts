import { Likes } from "../models/likes.model";
import { Users } from "../models/users.model";
import sequelize from '../models';

import { Request, Response } from 'express';
import { Posts } from "../models/posts.model";
import { Comments } from "../models/comments.model";
interface userIdInRequest extends Request {
    userId?: number
}

export const likesUser = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!;

    const userInfo = await Users.findById(userId);
    if (!userInfo) {
        return res.status(401).json({ "message": "token doesn't exist" });
    }
    try {
        const originTempLikeCount: any = await Posts.findAll({
            attributes: ['id'],
            include: [{
                model: Likes,
                required: true,
                attributes: ['postId'],
                as: 'postHasManyLikes'
            }]
        });

        let tempLikeCount: any = originTempLikeCount.map((item: any) => {

            const { postHasManyLikes: likes } = item.dataValues;
            return { likes: likes };
        })

        const result = await Posts.findAll({

            include: [{
                model: Likes,
                attributes: ['postId'],
                where: {
                    userId: userInfo.id
                },
                as: 'postHasManyLikes'
            },
            {
                model: Comments,
                attributes: ['id'],
                as: 'posthasManyComments'
            }],
            where: { userId: userInfo.id },
            order: [['createAt', 'DESC']],
        });

        if (result.length === 0) {
            return res.status(200).json(result);
        }

        let likesCount: any = [];

        tempLikeCount.map((count: any) => {

            let { likes } = count;
            likesCount.push(likes.length);
        })

        const response = result.map((post: any, idx: any) => {
            let { id, content, createAt, posthasManyComments: comments } = post.dataValues;
            return {
                id: id,
                content: content,
                createAt: createAt,
                likeCount: likesCount[idx],
                commentCount: comments.length
            };
        });
        //console.log(response)
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ "message": "Couldn't Find Like Post for UserId" })
    }
};

export const likesCreate = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!;
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).json({ "message": "no data has been sent!" });
    };

    try {
        const userInfo = await Users.findById(userId);
        if (!userInfo) {
            return res.status(401).json({ "message": "token doesn't exist" });
        }


        const overlapCheck = await Likes.overlapCheck(userId, postId)

        if (overlapCheck) {
            return res.status(200).json({ "message": "이미 따봉을 한 상태입니다." });
        };
        await Likes.create({
            userId: userId,
            postId: postId
        });
        return res.status(201).json({ "message": "created" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "message": "Couldn't Create Like" });
    }


};

export const likesDelete = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!;
    const postId = Number(req.params.postId);
    if (!postId) {
        return res.status(400).json({ "message": "no data has been sent!" });
    };

    try {
        const userInfo = await Users.findById(userId);
        if (!userInfo) {
            res.status(401).json({ "message": "token doesn't exist" });
        };

        const overlapCheck = await Likes.overlapCheck(userId, postId);
        if (!overlapCheck) {
            return res.status(200).json({ "message": "이미 따봉을 취소한 상태입니다." });
        }

        await Likes.destroy({
            where: {
                userId: userId,
                postId: postId
            }
        });
        return res.status(200).json({ "message": "delete!" });
    } catch (err) {
        return res.status(500).json({ "message": "Couldn't Delete Like" });
    };

};
