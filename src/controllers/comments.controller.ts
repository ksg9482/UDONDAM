import { Comments } from '../models/comments.model';
import { Posts } from '../models/posts.model';
import { Likes } from '../models/likes.model';

import { Request, Response } from 'express';
interface userIdInRequest extends Request {
    userId?:number
}


export const commentUser = async (req: userIdInRequest, res: Response) => {
    try {
        let posts: any = await Posts.findAll({
            include: [
                {
                    model: Comments,
                    attributes: [],
                    where: {
                        userId: req.userId
                    },
                    as: 'posthasManyComments'
                },
                {
                    model: Likes,
                    attributes: ['id'],
                    as: 'postHasManyLikes'
                }
            ],
            order: [['createAt', 'DESC']]
        });
        if (posts.length === 0) {
            return res.status(200).json(posts);
        };
        let commentPost = [];
        for (let el of posts) {
            const { id, content, createAt, postHasManyLikes: likes } = el.dataValues;
            let commentCount = await Comments.count({
                where: {
                    postId: id
                }
            });
            commentPost.push(
                {
                    id: id,
                    content: content,
                    createAt: createAt,
                    likeCount: likes.length,
                    commentCount: commentCount
                });
        };
        return res.status(200).send(commentPost);
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Server Error" });
    };
};

export const commentCreate = async (req: userIdInRequest, res: Response) => {

    const userId = Number(req.userId);

    const { postId, content, commentId } = req.body;
    try {
        if (postId && content && commentId) {
            await Comments.create({
                userId: userId, postId: postId, content: content, commentId: commentId
            });
            return res.status(201).json({ "message": "created!" });
        };
        await Comments.create({
            userId: userId, postId: postId, content: content
        });
        return res.status(201).json({ "message": "created!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "Server Error" });
    };
};

export const commentDelete = async (req: userIdInRequest, res: Response) => {
const userId = Number(req.userId);
    try {
        const commentDelete = await Comments.update(
            {
                content: '삭제 된 댓글 입니다'
            },
            {
                where: {
                    id: req.params.commentId, userId: userId
                }
            }
        );
        if (commentDelete[0] === 0) {
            return res.status(400).json({ "message": "comment doesn't exist" });
        };
        return res.status(200).json({ "message": "delete!" });
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Server Error" });
    };
};

