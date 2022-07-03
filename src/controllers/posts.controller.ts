import { IlikeArr, Posts } from '../models/posts.model';
import { Tags } from '../models/tags.model';
import { Users } from '../models/users.model';
import { Comments } from '../models/comments.model';
import { Likes } from '../models/likes.model';
import { Posts_Tags } from '../models/posts_tags.model';
import sequelize from '../models';
import { Op } from 'sequelize'

import { Request, Response } from 'express';
import { areaData } from './common/area/areaData';
import { isArea } from './common/area/areaHandle';

interface userIdInRequest extends Request {
    userId?: number;
    query: any;
}

export const postTag = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!
    let inputTagArr:string[] = req.query.tag ? req.query.tag : null;
    let inputNotTagArr:string[] | null = req.query.notTag 
    ? typeof req.query.notTag === 'string' 
        ? [req.query.notTag] 
        : req.query.notTag
    : null;

    let page = Number(req.query.page);
    let offset = 0;
    if (page !== 0) {
        offset = page * 10;
    }

    //1개면 string, 2개이상이면 array로 들어오기 때문에 array로 통일
    if (typeof inputNotTagArr === 'string') {
        inputNotTagArr = [inputNotTagArr];
    };

    const tags = Tags.setTagGroup(inputTagArr);
    if(tags.areaTag.length === 0) {
        return res.status(200).json([]);
    }

    try {
        const findPostId_OR = async (tagArr: string[], notTagArr: string[] |null) => {
            //만약 AND연산이 필요하면 having을 tagArr.length로 설정하면 된다.
            const countCheck = 2 //컨텐츠태그가 들어오면 지역+컨텐츠 해서 2개이상. tagArr.length일 경우 3개 들어오면 강제로 AND됨
            const having = tagArr.length > 1
                ? sequelize.literal(`count(postId) >= ${countCheck}`)
                : sequelize.literal(`count(postId) >= ${1}`);
            
            const includeNotTag_false = {
                model: Posts,
                as: 'posts_TagsBelongToPost',
                attributes: []
            };
            
            const includeNotTag_true = {
                model: Posts,
                as: 'posts_TagsBelongToPost',
                attributes: [],
                where:{id:{[Op.notIn]: [sequelize.literal(`(
                    SELECT DISTINCT posts.id FROM posts
                JOIN posts_tags ON posts_tags.postId = posts.id
                JOIN tags ON tags.id = posts_tags.tagId
                WHERE tags.content IN ('${notTagArr?.join("','")}')
                )`)]}}
            };

            const postModelByNotTag = !notTagArr ? includeNotTag_false : includeNotTag_true;

            const result = await Posts_Tags.findAll({
                attributes: ['postId'],
                include: [
                    postModelByNotTag,
                    {
                        model: Tags,
                        as: 'post_TagsBelongToTag',
                        where: { content: { [Op.in]: tagArr } },
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col("post_TagsBelongToTag.content")), "post_TagsBelongToTag.content"]],
                    }
                ],
                raw: true,
                group: ['postId'],
                having: having,
                limit: 10,
                offset: offset
            })

            return result;
        };
        
        const targetPostId = await findPostId_OR(inputTagArr ,inputNotTagArr)
        .then((result) => result.map((post: any) => { return post.postId }));
        
        //like랑 comment 분리. 결과값 여러개 나오는게 많아서 같은 내용이 여기저기 참조됨.
        const matchedPostAndTagArr = await Posts_Tags.findAll({
            attributes: ['postId'],
            where: { postId: { [Op.in]: targetPostId } },
            include: [
                {
                    model: Posts,
                    as: 'posts_TagsBelongToPost',
                    attributes: [['content', 'postContent'], 'public', 'createAt'],
                    include: [
                        {
                            model: Users,
                            as: 'postsbelongsToUser',
                            attributes: ['nickname'],
                            required: true,
                        }
                    ]
                },
                {
                    model: Tags,
                    as: 'post_TagsBelongToTag',
                    attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col("post_TagsBelongToTag.content")), "post_TagsBelongToTag.content"]],
                }
            ],
            raw: true,
            group: ['postId'],
            order: [['postId', 'DESC']]
        });

        const matchedCommentArr = await Comments.getMatchedComment(targetPostId);
        const sortedcommentArr = Comments.setCommentForm(matchedCommentArr);

        const matchedLikeArr:any = await Likes.matchedLike(targetPostId);
        const isLikedObj:any = await Likes.isLiked(userId, targetPostId);

        //포스트 & 태그, postId별로 정리된 코멘트, 각 포스트별 like수, 사용자가 like한 포스트
        const postForm = Posts.setPostForm(matchedPostAndTagArr, sortedcommentArr, matchedLikeArr, isLikedObj);

        console.log(postForm)
        return res.status(200).json(postForm);
    } catch (err) {
        return res.status(500).json({ "message": "Couldn't Find Tag Posts " });
    };
};

export const postUser = async (req: userIdInRequest, res: Response) => {
    interface IpostUserOutput {
        id: number;
        content: string;
        createAt: Date;
        likeCount: number;
        commentCount: number;
    }
    try {
        const posts = await Posts.findAll({
            attributes: ['id', 'content', 'createAt'],
            where: {
                userId: req.userId
            },
            include: [
                {
                    model: Likes,
                    attributes: ['id'],
                    as: 'postHasManyLikes'
                },
                {
                    model: Comments,
                    attributes: ['id'],
                    as: 'posthasManyComments',
    
                }
            ],
            order: [['createAt', 'DESC']],
        });
        
    
        if (posts.length === 0) {
            return res.status(200).json(posts);
        };
        let resPosts: IpostUserOutput[] = [];
        
        posts.map((post: any) => {
            const { id, content, createAt, postHasManyLikes: likes, posthasManyComments: comments } = post;
            resPosts.push({
                id: id,
                content: content,
                createAt: createAt,
                likeCount: !likes ? 0 : likes.length,
                commentCount: comments.length
            })
        })
        return res.status(200).send(resPosts);
    } catch (error) {
        return res.status(500).json({ "message": "Couldn't Find User Posts " });
    }
    
};

export const postPick = async (req: userIdInRequest, res: Response) => {
    const userId = req.userId!
    const postId = Number(req.params.postId);

    try {
        //findOne은 객체로 반환된다.
        const matchedPostAndTag = await Posts_Tags.findOne({
            attributes: ['postId'],
            where: { postId: postId },
            include: [
                {
                    model: Posts,
                    as: 'posts_TagsBelongToPost',
                    attributes: [['content', 'postContent'], 'public', 'createAt'],
                    include: [
                        {
                            model: Users,
                            as: 'postsbelongsToUser',
                            attributes: ['nickname'],
                            required: true,
                        }
                    ]
                },
                {
                    model: Tags,
                    as: 'post_TagsBelongToTag',
                    attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col("post_TagsBelongToTag.content")), "post_TagsBelongToTag.content"]],
                }
            ],
            raw: true,
            group: ['postId'],
            order: [['postId', 'DESC']]
        });

        const matchedCommentArr = await Comments.getMatchedComment([postId]);
        const sortedCommentObj = Comments.setCommentForm(matchedCommentArr);
        
        const matchedLikeArr:any  = await Likes.matchedLike([postId]);
        const isLikedObj:any = await Likes.isLiked(userId, [postId]);
        
        //포스트 & 태그, postId별로 정리된 코멘트, 각 포스트별 like수, 사용자가 like한 포스트
        const postForm = Posts.setPostForm([matchedPostAndTag], sortedCommentObj, matchedLikeArr, isLikedObj);
        
        const complitePostForm = Comments.insertComment(sortedCommentObj, postForm);
        
        return res.status(200).json(complitePostForm[0]);
    } catch (err) {
        return res.status(500).json({ "message": "Couldn't Find Post for postId" });
    };
};

export const postCreate = async (req: userIdInRequest, res: Response) => {
    const userId = Number(req.userId);
    
    const { content, public: _public, tag } = req.body;

    try {
        if (!content || !_public || !tag) {
            return res.status(400).json({ "message": "no data has been sent!" });
        };

        let Post: any = await Posts.create({
            content: content, public: _public, userId: userId
        });

        const createTag = await Tags.createTag(tag);
        const createPostsTags = await Posts_Tags.createPostsTags(Post.id, createTag.tagId);

        return res.status(201).json({ "message": "create!" });

    } catch (err) {
        return res.status(500).send({ "message": "Couldn't Create Post " });
    };

};

export const postDelete = async (req: userIdInRequest, res: Response) => {
    try {
        const postDelete = await Posts.destroy({
            where: {
                id: req.params.postId, userId: req.userId
            }
        });
        if (postDelete === 1) {
            return res.status(200).json({ "message": "delete!" });
        };
        return res.status(400).json({ "message": "post doesn't exist" });
    } catch (err) {
        //console.log(err);
        return res.status(500).send({ "message": "Couldn't Delete Post" });
    };
};

