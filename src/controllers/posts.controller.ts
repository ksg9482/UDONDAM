import { Posts } from '../models/posts.model';
import { Tags } from '../models/tags.model';
import { Users } from '../models/users.model';
import { Comments } from '../models/comments.model';
import { Likes } from '../models/likes.model';
import { Posts_Tags } from '../models/posts_tags.model';

export const postTag = async (req:any,  res:any) => {
    req.query.page = req.query.page || '1';
    //req.query.size = req.query.size || '2';
    req.userId = req.userId || 1;
    req.query.tag = req.query.tag || ["부산광역시", "대구광역시"];
    req.query.notTag = req.query.notTag || null;
    let page = Number(req.query.page);
    //let size = Number(req.query.size);
    let offset= 0;
    if(page !== 0) {
        offset = page * 10;
    }
    const areaTag = req.query.tag.filter((el:any) => {
        return el[el.length-1] === '시' || el[el.length-1] === '군'
    })
    const contentTag = req.query.tag.filter((el:any) => {
        return el[el.length-1] !== '시' && el[el.length-1] !== '군' && el[el.length-1] !== '요'
    })
    try{
    const areaPosts = await Posts.findAll({
        attributes:['id'],
        include:[
            {
                model: Tags,
                attributes:[],
                where:{
                    content: areaTag
                }
            }
        ],
    })
    if(areaPosts.length === 0) {
        return res.status(200).json(areaPosts);
    }
    let areaPostId = areaPosts.map((el:any)=>{
        return el.dataValues.id
    })
    if(contentTag.length !== 0) {
        const areaPostTags = await Posts.findAll({
        where:{
            id: areaPostId
        },
        include:[
            {
                model: Tags,
                attributes:['content'],
            }
        ]
        })
        const postTags = areaPostTags.filter((el:any)=> {
        const {tags} = el.dataValues;
        let tagCheck = false;
        const tagArr = [];
        for(let tag of tags) {
            tagArr.push(tag.content)
            if(tag.content[tag.content.length-1] !== '시' && tag[tag.content.length-1] !== '군') {
                    for(let el of contentTag) {
                        if(el === tag.content) {
                        tagCheck = true;
                        }
                    }
            }
        }
        if(req.query.notTag) {
            let notTagCheck = true;
            for(let el of tagArr) {
                for(let not of req.query.notTag) {
                    if(not === el) {
                        notTagCheck = false;
                    }
                }
            }
            return tagCheck === true && 
                    notTagCheck === true
        }
        return tagCheck === true
        })
        areaPostId = postTags.map((el:any)=> {
            return el.id
        })
    }
    if(req.query.notTag && contentTag.length === 0) {
        const areaNotTags = await Posts.findAll({
            where:{
                id: areaPostId
            },
            include:[
                {
                    model: Tags,
                    attributes:['content'],
                }
            ]
            })
        const areaNotTagFilter = areaNotTags.filter((el:any)=> {
            const {tags} = el.dataValues;
            let notCheck = true;
            for(let el of tags) {
                for(let not of req.query.notTag) {
                    if(el.content === not) {
                        notCheck = false;
                    }
                }
            }
            return notCheck === true
        })
        areaPostId = areaNotTagFilter.map((el:any) => {
            return el.id
        })
    }
    const posts = await Posts.findAll({
        where:{
            id:areaPostId
        },
        include: [
            {
                model: Users,
                attributes: ['nickname'],
                required: true
            },
            {
                model: Tags,
                attributes:['content'],
                required:true
            },
            {
                model: Likes,
                attributes: ['userId']
            },
            {
                model: Comments,
                attributes: ['id']
            }
        ],
        order: [['createAt','DESC']],
        offset: offset,
        limit: 10
    })
    const resPosts =  posts.map((post:any)=> {
        const {id, content, createAt, _public, userId, user, likes, tags, comments} = post;
        let tag = [];
        for(let el of tags) {
            tag.push(el.content)
        }
        let likeCheck = false;
        for(let like of likes) {
            if(like.userId === req.userId) {
                likeCheck = true;
            }
        }
        return {
            id: id,
            userId: userId,
            nickname: Users.nickname,
            content: content,
            tag: tag,
            commentCount: comments.length,
            likeCount: likes.length,
            likeCheck: likeCheck,
            createAt: createAt,
            public: _public
        };
    });
    return res.status(200).json(resPosts)
    } catch(err) {
        //console.log(err)
        return res.status(500).json({"message" : "Server Error"})
    }
};

export const postUser = async (req:any,  res:any) => {
    req.userId = req.userId || 1;
    
    const posts = await Posts.findAll({
        attributes: ['id', 'content', 'createAt'],
        where: {
            userId: req.userId
        },
        include:[
            {
                model: Likes,
                attributes: ['id'],
                as:'postHasManyLikes'
            },
            {
                model: Comments,
                attributes: ['id'],
                as:'posthasManyComments',
            
            }
        ],
        order: [['createAt','DESC']]
    });
    if(posts.length === 0) {
        return res.status(200).json(posts);
    }
    let resPosts:any = [];
    posts.map((post:any)=> {
        const {id, content, createAt, postHasManyLikes:likes, posthasManyComments:comments} = post;
        resPosts.push({
            id:id,
            content: content,
            createAt: createAt,
            likeCount: !likes? 0 : likes.length,
            commentCount: comments.length
        })
    })
    res.status(200).send(resPosts);
};

export const postPick = async (req:any,res:any) => {
    req.userId = req.userId || 1
    req.params.postId = req.params.postId || 1;
    const postPick:any = await Posts.findOne({
        where:{
            id: req.params.postId
        },
        include:[
            {
                model: Users,
                attributes: ['nickname'],
                required: true,
                as:'postsbelongsToUser'
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
               as:'postHasManyPosts_Tags'
            },
            {
                model: Comments,
                include:[
                    {
                        model: Users,
                        attributes:['nickname'],
                        required:true,
                        as:'commentsBelongsToUser'
                    }
                ],
                as:'posthasManyComments'
                
            },
            {
                model: Likes,
                attributes: ['userId'],
                as:'postHasManyLikes'
            }
        ]
    });
    try{
        
        if(postPick !== null){
            const {} = postPick;
        }
    const {
        id, 
        userId, 
        public:_public, 
        content, 
        createAt, 
        postsbelongsToUser:{
            dataValues:user
        }, 
        postHasManyPosts_Tags, 
        posthasManyComments, 
        postHasManyLikes:likes,
    } = postPick.dataValues;

    const tags = postHasManyPosts_Tags.map((tag:any) => {
        return tag.dataValues.post_TagsBelongToTag.dataValues
    });
    let comments = posthasManyComments.map((comment:any) => {
        const {
             id,
             content,
             userId,
             postId,
             commentId,
             createAt,
             commentsBelongsToUser:{
                dataValues:user
             }
        } = comment.dataValues;
        return {id, content, userId, postId, commentId, createAt, user};
    });

    function sortById(arr:any) {
        arr.sort((a:any, b:any) => a.id - b.id);
    }
    sortById(comments);
    
    let tag = [];
    for(let el of tags) {
        tag.push(el.content)
    }
    let likeCheck = false;
    for(let el of likes) {
        if(el.userId === req.userId) {
            likeCheck = true;
        }
    }
    let commentArr:any = [];
    let deleteArr:any = [];
    if(comments.length !== 0) {
        comments.map((el:any)=>{
            const {id, content, userId, postId, commentId, createAt, user} = el;
        if(commentId === null) {
            commentArr.push({
                id: id,
                content: content,
                nickname: user.nickname,
                userId: userId,
                postId: postId,
                commentId: commentId,
                createAt:createAt,
                comment: []
            });
        }
        else {
            let commentCheck = false;
            for(let comment of commentArr) {
                if(comment.id === commentId) {
                    commentCheck= true;
                    comment.comment.push({
                        id: id,
                        content: content,
                        nickname: user.nickname,
                        userId: userId,
                        postId: postId,
                        commentId: commentId,
                        createAt:createAt
                    })
                }
            }
            if(!commentCheck) {
                if(deleteArr.length !== 0) {
                    for(let el of deleteArr) {
                        if(el.id === commentId) {
                            el.comment.push({
                                id: id,
                                content: content,
                                nickname: user.nickname,
                                userId: userId,
                                postId: postId,
                                commentId: commentId,
                                createAt:createAt
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
                    createAt:null,
                    comment: [{
                        id: id,
                        content: content,
                        nickname: user.nickname,
                        userId: userId,
                        postId: postId,
                        commentId: commentId,
                        createAt:createAt
                    }]
                })
                }
            }
        }
    })
    }
    if(deleteArr.length !== 0) {
        for(let el of deleteArr) {
            let idx = commentArr.findIndex((ele:any)=> el.id < ele.id);
            if(idx === -1) {
                commentArr.push(el)
            }
            else{
                let left = commentArr.slice(0, idx);
                let right = commentArr.slice(idx, commentArr.length);
                commentArr = [...left, el, ...right]
            }
        }
    }
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
    }
    return res.status(200).json(resPost);
    } catch(err) {
        //console.log(err);
        res.status(500).json({"message" : "Server Error"})
    }
};

export const postCreate = async (req:any,  res:any) => {
    req.userId = req.userId || 1;
    const {content, public:_public, tag} = req.body;
    
    try{
        let Post:any = await Posts.create({
            content: content, public: _public, userId: req.userId
        })
        //db에 tag없으면 그냥 추가하는 걸로.
        const tagArr:any = await Tags.findAll({
            attributes:['id','content'],
            raw: true,
            where: {
                content: 'test1'//tag
            }
        })
        for(let el of tagArr) {
            await Posts_Tags.create({
                postId: Post.id, tagId: el.id
            })
        }
        return res.status(200).json({"message" : "create!"});
        
    } catch(err) {
        //console.log(err);
        return res.status(500).send("Server Error")
    }
    
};

export const postDelete = async (req:any,  res:any) => {
    req.userId = req.userId || 1,
    req.params.postId = req.params.postId || 14;
    try{
        const postDelete = await Posts.destroy({
        where: {
            id: req.params.postId, userId:req.userId
        }
    })
    if(postDelete === 1) {
        return res.status(200).json({"message": "delete!"});
    }
        return res.status(400).json({"message": "post doesn't exist"})
    } catch(err) {
        //console.log(err);
        return res.status(500).send("Server Error")
    }
};
