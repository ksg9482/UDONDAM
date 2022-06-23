import { Posts } from '../models/posts.model';
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
    let inputTagArr = req.query.tag ? req.query.tag : null;
    let inputNotTagArr = req.query.notTag ? req.query.notTag : null;

    //1개면 string, 2개이상이면 array로 들어오기 때문에 array로 통일
    if (typeof inputNotTagArr === 'string') {
        inputNotTagArr = [inputNotTagArr];
    };

    const tags = Tags.setTagGroup(inputTagArr)
    try {

       
        //정확히 뭘 찾는가? post는 다 찾아오는데 areaTag가 안맞으면 null로 처리하는가 아니면 맞는거만 가져오는가?
        const areaTagPosts: any = await Posts.findAll({
            attributes:[],
            include: [
                {
                    model: Posts_Tags,
                    as: 'postHasManyPosts_Tags',
                    include: [
                        {
                            model: Tags,
                            as: 'post_TagsBelongToTag',
                            where: { content: tags.areaTag },
                            attributes: ['content'],
                        }
                    ]
                }
            ]
        });
        
//이걸로 아이디 찾기
        const findPostId_OR = async (tagArr:string[]) => {
            //만약 AND연산이 필요하면 having을 tagArr.length로 설정하면 된다.
            const countCheck = 2 //컨텐츠태그가 들어오면 지역+컨텐츠 해서 2개이상.
            const having = tagArr.length > 1 
            ? sequelize.literal(`count(postId) >= ${countCheck}`) //컨텐츠 태그가 들어오면 컨텐츠가 있는것만 필터링
            : sequelize.literal(`count(postId) >= ${1}`)
            
            const result = await Posts_Tags.findAll({
                attributes:['postId'],
                include:[
                    {
                        model: Posts,
                        as: 'posts_TagsBelongToPost',
                        attributes: [/*['content', 'postContent']*/]   
                    },
                    {
                        model: Tags,
                        as: 'post_TagsBelongToTag',
                        where: { content:{[Op.in]:tagArr} },
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col("post_TagsBelongToTag.content")), "post_TagsBelongToTag.content"]],
                        
                    }
                ],
                raw:true,
                group:['postId'],
                having: having
            })

            return result
        };
        //test에 맞는 아이디만 반환되면 태그 검색 했을 때 맞는 태그만 나올것.
//이걸로 아이디에 맞는 포스트 찾기
        const targetPostId:number[] = await findPostId_OR(inputTagArr).then((result) => result.map((post:any)=>{return post.postId}));       
        /*
        commentCount
        likeCount
        likeCheck
        */
        const matchedPost = await Posts_Tags.findAll({
            attributes:['postId'],
            where:{postId:{[Op.in]:targetPostId}},
            include:[
                {
                    model: Posts,
                    as: 'posts_TagsBelongToPost',
                    attributes: [['content', 'postContent'], 'public', 'createAt'],
                    include:[
                        {
                            model: Users,
                            as: 'postsbelongsToUser',
                            attributes: ['nickname'],
                            required: true,
                        },
                        // {
                        //     model: Likes,
                        //     as: 'postHasManyLikes',//likeCount
                        //     attributes: {
                        //         include:[
                        //             //tag에 맞춰서 검출되는 게 늘어남. userId가 3개 나오니 count도 3됨
                        //             [sequelize.fn("COUNT", sequelize.col(`posts_TagsBelongToPost->postHasManyLikes.userId`)), "likeCount"],
                        //         ]
                        //     },
                        // },
                        // {
                        //     model: Comments,
                        //     as: 'posthasManyComments',
                        //     //attributes: ['content'],//commentCount
                        //     attributes: {
                        //         include:['id',
                        //             [sequelize.fn("COUNT", sequelize.col(`posts_TagsBelongToPost->posthasManyComments.content`)), "commentCount"],
                        //         ]
                        //     },
                        // },
                    ]
                },
                {
                    model: Tags,
                    as: 'post_TagsBelongToTag',
                    attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col("post_TagsBelongToTag.content")), "post_TagsBelongToTag.content"]],
                }
            ],
            raw:true,
            //
            group:['postId']
        });
//like랑 comment 분리하자. 왜? 서로 결과값 여러개 나오는게 많아서 같은 내용을 여러번 읽음.

//matchedComment 이건 findAll로 내용이랑 갯수. comment에서 재활용(findandCountAll은 IN으로 읽으면 그거 다 읽음)

//matchedLike 이건 Count만. 내가 like했는지 어떻게 확인?
        // const matchedComment = await Comments.findAll({
        //     raw:true,
        //     where:{postId:{[Op.in]:targetPostId}},
        //     include:[
        //         {
        //             model:Users,
        //             as:'commentsBelongsToUser',
        //             attributes:['nickname']
        //         }
        //     ],
        //     //attributes:[],//'postId', 'userId'
        //     logging:true,
        //     order:['postId']
        //     //group:'postId'
        // });
        const getmachedComment = await Comments.matchedComment(targetPostId)
        console.log(getmachedComment)
        //console.log(matchedComment) 
        /*
        {
        id: 1,
        content: 'testComment1',
        userId: 2,
        postId: 2,
        commentId: null,
        createAt: 2022-06-23T08:29:46.000Z,
        updatedAt: 2022-06-23T08:29:46.000Z
      }
        */
        // const matchedLike = await Likes.findAll({
        //     where: { postId: { [Op.in]: targetPostId } },
        //     attributes: {
        //         include: [
        //             //tag에 맞춰서 검출되는 게 늘어남. userId가 3개 나오니 count도 3됨
        //             [sequelize.fn("COUNT", sequelize.col('userId')), "likeCount"],
        //         ],
        //         exclude:['id', 'createAt', 'updatedAt', 'userId']
        //     },
        //     raw: true,
        //     group: ['postId'],
        //     logging:true
        // })
        const matchedLike = await Likes.matchedLike(targetPostId);
       
//isLiked 이건 userId랑 postId 입력하면 like했는지 확인. like에서 재활용
        // const isLiked = async (userId: number) => {
        //     const result = await Likes.findOne({
        //         attributes:['userId'],
        //         where:{userId: userId}
        //     });

        //     return result ? true : false
        // };
const likeCheck = await Likes.isLiked(userId); //이거 오버랩체크랑 뭐가 다른지?

        if (areaTagPosts.length === 0) { //areaTag에 해당하는 post가 없으면 그냥 return
            return res.status(200).json(areaTagPosts);
        };

        let areaTagpostId = areaTagPosts.map((el: any) => { //areaTagPosts postId만 뽑는다 
            
            return el.dataValues.postHasManyPosts_Tags.length !== 0 ? el.dataValues.postHasManyPosts_Tags[0].dataValues.postId : null
        }).filter((el: any) => { return el !== null });
        

        if (tags.contentTag.length !== 0) { //contentTag에 내용이 있으면 
            const areaPostTags: any = await Posts.findAll({
                where: {
                    id: areaTagpostId //areaTag에 해당하는 post만 뽑는다
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

            // const postTagsFilter = (el: any) => {
            //     const inputData = el.dataValues.postHasManyPosts_Tags.map((el: any) => {
            //         return el.dataValues.post_TagsBelongToTag.dataValues;
            //     });
            //     //이건 도대체 뭘 어떻게 바꾸는지?

            //     const tagArr: any = [];

            //     //태그가 컨텐츠 태그만 있는지 확인. 앞에서 분류 했을 텐데?
            //     const tagCheck = (inputData: any) => {
            //         let result = false;
            //         //태그 배열에 넣기와 태그 체크. 2가지 책임을 갖음
            //         for (let tag of inputData) {
            //             tagArr.push(tag.content) //tagArr에 tag내용을 넣는다
            //             if (tag.content[tag.content.length - 1] !== '시' && tag[tag.content.length - 1] !== '군') { //만약 tag내용이 areaTag가 아니라면
            //                 for (let el of tags.contentTag) {
            //                     if (el === tag.content) {
            //                         result = true;
            //                     };
            //                 };
            //             };
            //         };
            //         return result;
            //     };

            //     //태그랑 낫태그랑 비교해서 겹치는게 있나 확인. 태그체크가 다 true면 그거만 필터링
            //     const notTagCheck = (tagArr: any) => {
            //         let result = true;
            //         for (let el of tagArr) {
            //             for (let not of inputNotTagArr) { //notTag가 존재한다면
            //                 if (not === el) {
            //                     result = false;
            //                 };
            //             };
            //         };
            //         //notTag와 el이 겹치지 않아야 true 리턴
            //         return result;
            //     };
            //     if (inputNotTagArr) {
            //         // let notTagCheck = true;
            //         // for (let el of tagArr) {
            //         //     for (let not of inputNotTagArr) { //notTag가 존재한다면
            //         //         if (not === el) {
            //         //             notTagCheck = false;
            //         //         };
            //         //     };
            //         // };
            //         //notTag에 해당하지 않는다.
            //         return tagCheck(inputData) === true && notTagCheck(tagArr) === true;
            //     }
            //     return tagCheck(inputData) === true;
            // }
            //filter 조건함수 분리
            const postTags = areaPostTags//.filter((el: any) => postTagsFilter(el));
//console.log(postTags, areaPostTags)
            areaTagpostId = postTags.map((el: any) => {
                return el.dataValues.id;
            });
        };
        //낫태그가 들어왔고, 컨텐츠태그는 없으면 에리어태그만 검색해서 낫 태그 없는거만 필터링
        //이거 ORM으로 못하는지?
        if (inputNotTagArr && tags.contentTag.length === 0) {
            const areaNotTags = await Posts.findAll({
                where: {
                    id: areaTagpostId
                },
                include: [
                    {
                        model: Tags,
                        attributes: ['content'],
                    }
                ]
            });
            //areaNotTagFilter 필터 분리
            // const areaNotTagFilterFunction = (el: any) => {
            //     const { tags } = el.dataValues;
            //     let notCheck = true;
            //     for (let el of tags) {
            //         for (let not of inputNotTagArr) {
            //             if (el.content === not) {
            //                 notCheck = false;
            //             };
            //         };
            //     };
            //     return notCheck === true;
            // }
            //areaNotTagFilter 필터 분리
            const areaNotTagFilter = areaNotTags//.filter((el: any) => areaNotTagFilterFunction(el));
            areaTagpostId = areaNotTagFilter.map((el: any) => {
                return el.id;
            });
        }; //notTag 관련
        //최종적으로 나오게 할 결과물을 10개씩 끊어서 검색. 그걸 map으로 폼 맞춰서 반환.
        //페이지네이션 용도
        let page = Number(req.query.page);
        //let size = Number(req.query.size);
        let offset = 0;
        if (page !== 0) {
            offset = page * 10;
        }
        //페이지네이션 용도

        const posts = await Posts.findAll({
            where: {
                id: areaTagpostId
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
        //console.log(posts)
        //1.낫태그 해당하는 포스트 아이디만 distinct로 뽑음 -> 낫태그 해당 포스트아이디.
        //2.그거만 NOT IN으로 다 제외
        //3.근데 이건 비효율적
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
        const resPosts = posts.map((el: any) => resPostsMapFunction(el));

        return res.status(200).json(resPosts);
    } catch (err) {
        //console.log(err)
        return res.status(500).json({ "message": "Server Error" })
    };
};

export const postUser = async (req: userIdInRequest, res: Response) => {
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
        order: [['createAt', 'DESC']]
    });
    // const [postUserResults, _] = await sequelize.query(
    //     `SELECT posts.id, posts.content, posts.createAt,
    //     COUNT(likes.id) AS likeCount,
    //     COUNT(comments.id) AS commentCount
    //     FROM posts 
    //     LEFT OUTER JOIN likes 
    //     ON posts.id = likes.postId
    //     LEFT OUTER JOIN comments
    //     ON posts.id = comments.postId
    //     WHERE posts.userId = ${req.userId}
    //     GROUP BY posts.id
    //     ORDER BY posts.createAt DESC;`
    // );

    if (posts.length === 0) {
        return res.status(200).json(posts);
    };
    let resPosts: any = [];
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
    res.status(200).send(resPosts);
};

export const postPick = async (req: userIdInRequest, res: Response) => {
    const postId = req.params.postId;

    try {
        const postPick: any = await Posts.findOne({
            where: {
                id: postId
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
        const sortById = (arr: any) => {
            arr.sort((a: any, b: any) => a.id - b.id);
        };
        const comments = posthasManyComments.map((comment: any) => {
            const {
                commentsBelongsToUser: {
                    dataValues: user
                },
                id, content, userId, postId, commentId, createAt
            } = comment.dataValues;
            return { id, content, userId, postId, commentId, createAt, user };
        }).sort((arr: any) => sortById(arr));


        //sortById(comments);

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
            comments.map((el: any) => commentMapFunction(el));
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
        const tagMapFunction = async (el: any) => {
            // 어차피 운영진이 주는 태그만 쓰게할거면 findOrCreate쓸 필요가?
            const data: any = await Tags.findOrCreate({
                attributes: ['id', 'content'],
                where: {
                    content: el
                },
                raw: true
            });
            //console.log(data)
            const tagId = data[0].id;

            await Posts_Tags.create({
                postId: Post.id, tagId: tagId
            });
        }
        //tag map 분리
        await tag.map(tagMapFunction);

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
        return res.status(500).send("Coudn't Delete Post");
    };
};

