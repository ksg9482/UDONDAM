import { Likes } from "../models/likes.model";
import { Users } from "../models/users.model";
import sequelize from '../models';
import { Op } from 'sequelize';

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
        //아이디만 검출 -> 아이를 IN으로 넣어서 post+likeCount 반환
        //각 포스트의 likeCount를 얻어야 하는데 like 검색조건이 userId라 갯수 반환이 제대로 안됨
        const matchedPostId: any = await Posts.findAll({
            attributes:[[sequelize.fn('DISTINCT', sequelize.col('posts.id')) ,'id']],
            include: [
                {
                    model: Likes,
                    attributes: ['id'],
                    as: 'postHasManyLikes',
                    where:{
                        userId: userId
                    }
                }
            ],
            raw: true
        });
        const postIdArr = Comments.getPostIdArr(matchedPostId)
        
        const matchedPostAndComment: any = await Posts.findAll({
            attributes:[[sequelize.fn('DISTINCT', sequelize.col('posts.id')) ,'id'],'content', 'createAt'],
            include: [
                {
                    model: Comments,
                    attributes: [[sequelize.fn("COUNT", sequelize.col('posthasManyComments.content')), "commentCount"]],
                    as: 'posthasManyComments'
                }
            ],
            where:{id:{[Op.in]:postIdArr}},
            raw: true,
            group:['posts.id'],
            order: [['id', 'DESC']]
        });

         const likeCountArr = await Likes.matchedLike(postIdArr);
        
         const likePostForm = Comments.setCommentPostForm(matchedPostAndComment, likeCountArr);
         
        return res.status(200).json(likePostForm);

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
