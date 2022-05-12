import { Comments } from "../models/comments.model";
import { Likes } from "../models/likes.model";
import { Posts } from "../models/posts.model";
import { Users } from "../models/users.model";
import  sequelize  from "sequelize";
import { isAuthorized } from '../controllers/token.controller';

export const likesUser = async (req:any,  res:any) => {
        const userId = req.userId || 1;
        //const { userId } = req.query;
        let userInfo:any = await Users.findOne({
            where: {
                //id: userId
                id: userId
            }
        })
        if(!userInfo){
            res.status(401).json({ "message" : "token doesn't exist" });
        }
        else {
            const originTempLikeCount:any = await Posts.findAll({
                attributes: ['id'],
                include: [{
                    model: Likes,
                    required: true,
                    attributes: ['postId'],
                    as:'postHasManyLikes'
                }]
            });
            //console.log(originTempLikeCount)
            let tempLikeCount:any = originTempLikeCount.map((item:any) => {
                //console.log(item)
                const {postHasManyLikes:likes} = item.dataValues;
                return {likes:likes};
            })
            
            const result = await Posts.findAll({
            
                include: [{
                    model: Likes,
                    //required: true,
                    attributes: ['postId'],
                    where: {
                        userId: userInfo.id
                    },
                    as:'postHasManyLikes'
                },
                {
                    model: Comments,
                    attributes: ['id'],
                    //required: true,
                    as:'posthasManyComments'
                }],
                where: {userId:userInfo.id},
                order: [['createAt','DESC']],
                // limit: 10
            });
            // let likeCount = await likes.count({ where: {postId: id} });
            //console.log(tempLikeCount[0].dataValues.postHasManyLikes[0])
            if(result.length === 0){
                return res.status(200).json(result);
            }
            else{
                let likesCount:any = []; //{likes:[{1},{2}]}
                
                tempLikeCount.map((count:any) => {
                   // console.log(count)
                    let { likes } = count;
                    likesCount.push(likes.length);
                })

                const response = result.map((post:any, idx:any) => {
                    let { id, content, createAt, posthasManyComments:comments } = post.dataValues;
                    
                    return {
                        id: id,
                        content: content,
                        createAt: createAt,
                        likeCount: likesCount[idx],
                        commentCount: comments.length
                    };
                });
                
                // return res.status(200).json({likesCount: temp});
                return res.status(200).json(response);
            }
            
        }
    };

    export const likesCreate = async (req:any,  res:any) => {
        const userId = req.userId || 2;
        const { postId } = req.body;
        let userInfo = await Users.findOne({
            where: {
                id: userId
            }
        });
        let overlapCheck = await Likes.findOne({
            where: {
                userId: userId,
                postId: postId
            }
        });

        if(!userInfo){
            res.status(401).json({ "message" : "token doesn't exist" });
        }
        else {
            if(!overlapCheck){
                await Likes.create({
                    userId: userId,
                    postId: postId
                })
                res.status(200).json({ "message" : "created" });
            }
            else{
                res.status(200).json({ "message" : "이미 따봉을 한 상태입니다." });
            }
        }
    };

    export const likesDelete = async (req:any,  res:any) => {
        //const userId = req.userId || 2;
        req.userId = req.userId || 1;
        req.params.postId = req.params.postId || 1;
        //const { postId } = req.query;
        let userInfo = await Users.findOne({
            where: {
                id: req.userId
            }
        });
        let overlapCheck = await Likes.findOne({
            where: {
                userId: req.userId,
                postId: req.params.postId
            }
        });

        if(!userInfo){
            res.status(401).json({ "message" : "token doesn't exist" });
        }  
        else{
            if(!overlapCheck){
                return res.status(200).json({ "message" : "이미 따봉을 취소한 상태입니다." });
            }
            else {
                try{
                    await Likes.destroy({
                        where: {
                            userId: req.userId,
                            postId : req.params.postId
                        }
                    });
                    return res.status(200).json({ "message" : "delete!" });  
                } catch(err) {
                    //console.log(err);
                    return res.status(500).json({ "message" : "Server Error" });
                }
            }
        }
    };
