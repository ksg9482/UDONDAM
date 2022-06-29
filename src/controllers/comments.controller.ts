import { Comments } from '../models/comments.model';
import { Posts } from '../models/posts.model';
import { Likes } from '../models/likes.model';

import { Request, Response } from 'express';
import sequelize from '../models';
interface userIdInRequest extends Request {
    userId?:number
}


export const commentUser = async (req: userIdInRequest, res: Response) => {
    try {

        const matchedPostAndComment: any = await Posts.findAll({
            attributes:[[sequelize.fn('DISTINCT', sequelize.col('posts.id')) ,'id'],'content', 'createAt'],
            include: [
                {
                    model: Comments,
                    attributes: [[sequelize.fn("COUNT", sequelize.col('posthasManyComments.content')), "commentCount"]],
                    where: {
                        userId: req.userId
                    },
                    as: 'posthasManyComments'
                }
            ],
            raw: true,
            group:['posts.id'],
            order: [['id', 'DESC']]
        });

        const postIdArr = Comments.getPostIdArr(matchedPostAndComment);
        
        const likeCountArr = await Likes.matchedLike(postIdArr);
        
        const likePostForm = Comments.setCommentPostForm(matchedPostAndComment, likeCountArr);

        return res.status(200).send(likePostForm);
    } catch (err) {
        return res.status(500).json({ "message": "Couldn't Find Comment Post for UserId" });
    };
};

export const commentCreate = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!;
    const { postId, content, commentId } = req.body;
    try {
        if(!postId || !content) {
            return res.status(400).json({ "message": "no data has been sent!" });
        };

        if (commentId) {
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
        //console.log(err);
        return res.status(500).json({ "message": "Couldn't Create Comment" });
    };
};

export const commentDelete = async (req: userIdInRequest, res: Response) => {
const userId = req.userId!;
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
        return res.status(500).json({ "message": "Couldn't Delete Comment" });
    };
};

