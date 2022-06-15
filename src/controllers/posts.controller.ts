import { Posts } from '../models/posts.model';
import { Tags } from '../models/tags.model';
import { Users } from '../models/users.model';
import { Comments } from '../models/comments.model';
import { Likes } from '../models/likes.model';
import { Posts_Tags } from '../models/posts_tags.model';
import sequelize from '../models';

import { Request, Response } from 'express';
import { areaData } from './common/area/areaData';
import { areaCheck } from './common/area/areaHandle';
interface userIdInRequest extends Request {
    userId?: number;
    query: any;
}

export const postTag = async (req: userIdInRequest, res: Response) => {
    //이건 삭제
    req.query.tag = req.query.tag || null;
    req.query.notTag = req.query.notTag || null;

    //이거 사용
    const tag = req.query.tag ? req.query.tag : null;
    const notTag = req.query.notTag ? req.query.notTag : null;

    if (typeof req.query.notTag === 'string') { //1개면 string, 2개이상이면 array로 들어오기 때문에 array로 통일
        req.query.notTag = [req.query.notTag];
    };
    // 이걸로 태그 분리 완료
    const tagHandle = (tags: Array<string>) => {
        const areaTag = [];
        const contentTag = [];

        for (let tag of tags) {
            //'육군' 처럼 area가 아님에도 '군'이나 '시'로 끝나는 태그 식별        
            const areaIsTrue = areaCheck(tag)
            areaIsTrue ? areaTag.push(tag) : contentTag.push(tag)
        }
        
        return { areaTag, contentTag }
    }

    const tags = tagHandle(tag)
    //페이지네이션 용도
    let page = Number(req.query.page);
    //let size = Number(req.query.size);
    let offset = 0;
    if (page !== 0) {
        offset = page * 10;
    }
    //사실상 여기부터 정리.
    const areaTag = req.query.tag.filter((el: any) => {
        return el[el.length - 1] === '시' || el[el.length - 1] === '군';
    })
    const contentTag = req.query.tag.filter((el: any) => {
        return el[el.length - 1] !== '시' && el[el.length - 1] !== '군' && el[el.length - 1] !== '요';
    });
    //구체적으로: 태그에 해당하는 포스트를 불러와야 한다
    //해당하는 태그가 하나라도 있다면 가져와야 하고
    //notTag는 검색결과에서 제외해야 한다.
    try {
        const areaPosts: any = await Posts.findAll({
            include: [
                {
                    model: Posts_Tags,
                    as: 'postHasManyPosts_Tags',
                    include: [
                        {
                            model: Tags,
                            as: 'post_TagsBelongToTag',
                            where: { content: areaTag },
                            attributes: ['content'],
                        }
                    ]
                }
            ]
        });

        if (areaPosts.length === 0) { //areaTag에 해당하는 post가 없으면 그냥 return
            return res.status(200).json(areaPosts);
        };

        let areaPostId = areaPosts.map((el: any) => { //areaPosts의 postId만 뽑는다 
            return el.dataValues.postHasManyPosts_Tags.length !== 0 ? el.dataValues.id : null
        }).filter((el: any) => { return el !== null });

        if (contentTag.length !== 0) { //contentTag에 내용이 있으면 
            const areaPostTags: any = await Posts.findAll({
                where: {
                    id: areaPostId //areaTag에 해당하는 post만 뽑는다
                },
                include: [
                    {
                        model: Posts_Tags,
                        as: 'postHasManyPosts_Tags',
                        include: [
                            {
                                model: Tags,
                                as: 'post_TagsBelongToTag',
                                attributes: ['content'], //tag도 뽑는다
                            }
                        ]
                    }
                ]
            });
            //filter 조건함수 분리
            const filterFunction = (el: any) => {
                const tags = el.dataValues.postHasManyPosts_Tags.map((el: any) => {
                    return el.dataValues.post_TagsBelongToTag.dataValues;
                });

                let tagCheck = false;
                const tagArr = [];
                for (let tag of tags) {
                    tagArr.push(tag.content) //tagArr에 tag내용을 넣는다
                    if (tag.content[tag.content.length - 1] !== '시' && tag[tag.content.length - 1] !== '군') { //만약 tag내용이 areaTag가 아니라면
                        for (let el of contentTag) {
                            if (el === tag.content) {
                                tagCheck = true;
                            };
                        };
                    };
                };

                if (req.query.notTag) {
                    let notTagCheck = true;
                    for (let el of tagArr) {
                        for (let not of req.query.notTag) { //notTag가 존재한다면
                            if (not === el) {
                                notTagCheck = false;
                            };
                        };
                    };
                    return tagCheck === true && notTagCheck === true;
                }
                return tagCheck === true;
            }
            //filter 조건함수 분리
            const postTags = areaPostTags.filter(filterFunction);

            areaPostId = postTags.map((el: any) => {
                return el.dataValues.id;
            });
        };

        if (req.query.notTag && contentTag.length === 0) {
            const areaNotTags = await Posts.findAll({
                where: {
                    id: areaPostId
                },
                include: [
                    {
                        model: Tags,
                        attributes: ['content'],
                    }
                ]
            });
            //areaNotTagFilter 필터 분리
            const areaNotTagFilterFunction = (el: any) => {
                const { tags } = el.dataValues;
                let notCheck = true;
                for (let el of tags) {
                    for (let not of req.query.notTag) {
                        if (el.content === not) {
                            notCheck = false;
                        };
                    };
                };
                return notCheck === true;
            }
            //areaNotTagFilter 필터 분리
            const areaNotTagFilter = areaNotTags.filter(areaNotTagFilterFunction);
            areaPostId = areaNotTagFilter.map((el: any) => {
                return el.id;
            });
        }; //notTag 관련

        const posts = await Posts.findAll({
            where: {
                id: areaPostId
            },
            include: [
                {
                    model: Users,
                    attributes: ['nickname'],
                    required: true,
                    as: 'postsbelongsToUser'
                },
                {
                    model: Likes,
                    attributes: ['userId'],
                    as: 'postHasManyLikes'
                },
                {
                    model: Comments,
                    attributes: ['id'],
                    as: 'posthasManyComments'
                },
                {
                    model: Posts_Tags,
                    as: 'postHasManyPosts_Tags',
                    include: [
                        {
                            model: Tags,
                            as: 'post_TagsBelongToTag',
                            attributes: ['content'], //tag도 뽑는다
                            required: true
                        }
                    ]
                }
            ],
            order: [['createAt', 'DESC']],
            offset: offset,
            limit: 10
        });
        //map 분리
        const resPostsMapFunction = (post: any) => {

            const {
                dataValues: { id, content, createAt, public: _public, userId, postsbelongsToUser: { dataValues: { nickname } } },
                postHasManyLikes: likes,
                posthasManyComments: comments,
                postHasManyPosts_Tags: tags,
            } = post;

            let tag = [];
            for (let el of tags) {
                tag.push(el.dataValues.post_TagsBelongToTag.dataValues.content)
            };
            let likeCheck = false;
            for (let like of likes) {
                if (like.userId === req.userId) {
                    likeCheck = true;
                }
            };
            return {
                id: id,
                userId: userId,
                nickname: nickname,
                content: content,
                tag: tag,
                commentCount: comments.length,
                likeCount: likes.length,
                likeCheck: likeCheck,
                createAt: createAt,
                public: _public
            };
        }
        //map 분리
        const resPosts = posts.map(resPostsMapFunction);

        return res.status(200).json(resPosts);
    } catch (err) {
        console.log(err)
        return res.status(500).json({ "message": "Server Error" })
    };
};

export const postUser = async (req: userIdInRequest, res: Response) => {

    const [postUserResults, _] = await sequelize.query(
        `SELECT posts.id, posts.content, posts.createAt,
        COUNT(likes.id) AS likeCount,
        COUNT(comments.id) AS commentCount
        FROM posts 
        LEFT OUTER JOIN likes 
        ON posts.id = likes.postId
        LEFT OUTER JOIN comments
        ON posts.id = comments.postId
        WHERE posts.userId = ${req.userId}
        GROUP BY posts.id
        ORDER BY posts.createAt DESC;`
    );

    if (postUserResults.length === 0) {
        return res.status(200).json(postUserResults);
    };

    res.status(200).send(postUserResults);
};

export const postPick = async (req: userIdInRequest, res: Response) => {

    const postPick: any = await Posts.findOne({
        where: {
            id: req.params.postId
        },
        include: [
            {
                model: Users,
                attributes: ['nickname'],
                required: true,
                as: 'postsbelongsToUser'
            },
            {
                model: Posts_Tags,
                include: [
                    {
                        model: Tags,
                        attributes: ['content'],
                        required: true,
                        as: 'post_TagsBelongToTag'
                    }
                ],
                as: 'postHasManyPosts_Tags'
            },
            {
                model: Comments,
                include: [
                    {
                        model: Users,
                        attributes: ['nickname'],
                        required: true,
                        as: 'commentsBelongsToUser'
                    }
                ],
                as: 'posthasManyComments'

            },
            {
                model: Likes,
                attributes: ['userId'],
                as: 'postHasManyLikes'
            }
        ]
    });
    try {
        const {
            id,
            userId,
            public: _public,
            content,
            createAt,
            postsbelongsToUser: {
                dataValues: user
            },
            postHasManyPosts_Tags,
            posthasManyComments,
            postHasManyLikes: likes,
        } = postPick.dataValues;

        const tags = postHasManyPosts_Tags.map((tag: any) => {
            return tag.dataValues.post_TagsBelongToTag.dataValues
        });
        let comments = posthasManyComments.map((comment: any) => {
            const {
                commentsBelongsToUser: {
                    dataValues: user
                },
                id, content, userId, postId, commentId, createAt
            } = comment.dataValues;
            return { id, content, userId, postId, commentId, createAt, user };
        });

        function sortById(arr: any) {
            arr.sort((a: any, b: any) => a.id - b.id);
        };
        sortById(comments);

        let tag = [];
        for (let el of tags) {
            tag.push(el.content);
        };
        let likeCheck = false;
        for (let el of likes) {
            if (el.userId === req.userId) {
                likeCheck = true;
            };
        };
        let commentArr: any = [];
        let deleteArr: any = [];
        if (comments.length !== 0) {
            //comments map 분리
            const commentMapFunction = (el: any) => {
                const { id, content, userId, postId, commentId, createAt, user } = el;
                if (commentId === null) {
                    commentArr.push({
                        id: id,
                        content: content,
                        nickname: user.nickname,
                        userId: userId,
                        postId: postId,
                        commentId: commentId,
                        createAt: createAt,
                        comment: []
                    });
                }
                else {
                    let commentCheck = false;
                    for (let comment of commentArr) {
                        if (comment.id === commentId) {
                            commentCheck = true;
                            comment.comment.push({
                                id: id,
                                content: content,
                                nickname: user.nickname,
                                userId: userId,
                                postId: postId,
                                commentId: commentId,
                                createAt: createAt
                            })
                        }
                    };
                    if (!commentCheck) {
                        if (deleteArr.length !== 0) {
                            for (let el of deleteArr) {
                                if (el.id === commentId) {
                                    el.comment.push({
                                        id: id,
                                        content: content,
                                        nickname: user.nickname,
                                        userId: userId,
                                        postId: postId,
                                        commentId: commentId,
                                        createAt: createAt
                                    })
                                }
                            }
                        }
                        else {
                            deleteArr.push({
                                id: commentId,
                                content: '탈퇴 한 회원이 작성한 댓글입니다',
                                nickname: null,
                                userId: null,
                                postId: postId,
                                commentId: null,
                                createAt: null,
                                comment: [{
                                    id: id,
                                    content: content,
                                    nickname: user.nickname,
                                    userId: userId,
                                    postId: postId,
                                    commentId: commentId,
                                    createAt: createAt
                                }]
                            });
                        };
                    };
                };
            }
            //comments map 분리
            comments.map(commentMapFunction);
        };
        if (deleteArr.length !== 0) {
            for (let el of deleteArr) {
                let idx = commentArr.findIndex((ele: any) => el.id < ele.id);
                if (idx === -1) {
                    commentArr.push(el)
                }
                else {
                    let left = commentArr.slice(0, idx);
                    let right = commentArr.slice(idx, commentArr.length);
                    commentArr = [...left, el, ...right]
                };
            };
        };
        const resPost = {
            id: id,
            userId: userId,
            nickname: user.nickname,
            content: content,
            public: _public,
            likeCount: likes.length,
            commentCount: comments.length,
            likeCheck: likeCheck,
            createAt: createAt,
            tag: tag,
            comment: commentArr
        };
        return res.status(200).json(resPost);
    } catch (err) {
        //console.log(err);
        res.status(500).json({ "message": "Server Error" })
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

        //tag map 분리
        const tagMapFunction = async (el:any) => {
             // 어차피 운영진이 주는 태그만 쓰게할거면 findOrCreate쓸 필요가?
             const data: any = await Tags.findOrCreate({
                attributes: ['id', 'content'],
                where: {
                    content: el
                }
            });

            const tagId = data[0].dataValues.id;

            await Posts_Tags.create({
                postId: Post.id, tagId: tagId
            });
        }
        //tag map 분리
        await tag.map(tagMapFunction);

        return res.status(201).json({ "message": "create!" });

    } catch (err) {
        //console.log(err);
        return res.status(500).send("Server Error");
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
        return res.status(500).send("Coudn't Delete Post");
    };
};
