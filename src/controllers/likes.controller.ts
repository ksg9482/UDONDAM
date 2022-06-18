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

    else {
        const [likeUserResult, _] = await sequelize.query(`
            SELECT posts.id, posts.content, posts.userId, posts.public, posts.createAt, posts.updatedAt, 
            COUNT(likes.id) AS 'likeCount', 
            COUNT(comments.id) AS 'CommentCount' 
            FROM posts AS posts 
            LEFT OUTER JOIN likes
            ON posts.id = likes.postId AND likes.userId = ${req.userId} 
            LEFT OUTER JOIN comments
            ON posts.id = comments.postId AND comments.userId = ${req.userId}
            WHERE posts.userId = ${req.userId} 
            GROUP BY posts.id
            ORDER BY posts.createAt DESC;
            `);
//likeCount, commentCount
const test = await Posts.findAll({
    attributes:['id', 'content', 'createAt'],
    where:{userId:userId},
    raw:true,
    include:[{
        model: Likes,
        attributes: ['userId'],
        as: 'postHasManyLikes',
        where:{userId:userId}
    },
    // {
    //     model: Comments,
    //     attributes: ['id'],
    //     as: 'posthasManyComments'
    // }
]
})
        if (likeUserResult.length === 0) {
            return res.status(200).json(likeUserResult);
        }
        else {
            const responseMapFunction = (post: any) => {
                let { id, content, createAt, likeCount, CommentCount } = post;
                return {
                    id: id,
                    content: content,
                    createAt: createAt,
                    likeCount: likeCount,
                    commentCount: CommentCount
                };
            }
            const response = likeUserResult.map(responseMapFunction);
            //console.log(likeUserResult, response, test)
            return res.status(200).json(response);
        };
    };
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
