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
            raw: true,
            order: [['createAt', 'DESC']]
        });

        if (posts.length === 0) {
            return res.status(200).json(posts);
        };
        //query문 손봐서 -> 각 포스트가 likeCount, commentConut를 가지게끔 해야함
        let commentPost = [];
        
        for (let el of posts) {
            const { id, content, createAt, postHasManyLikes: likes } = el;
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
        //likes에 문제 있음.
        console.log(commentPost)
        return res.status(200).send(commentPost);
    } catch (err) {
        //console.log(err);
        return res.status(500).json({ "message": "Server Error" });
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
        // 댓글은 완전히 삭제되는 것이 아니라 삭제된 댓글이라는 내용으로 변화
        // 그럼 데이터베이스가 무한정 늘기만 한다. 어떻게 해결? 단지 삭제 된 댓글이라는 내용을 보관하기 위해 용량을 소모하는 것은 비효율적.
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

