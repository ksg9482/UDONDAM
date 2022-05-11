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
            const tempLikeCount = await Posts.findAll({
                attributes: ['id'],
                include: [{
                    model: Likes,
                    required: true,
                    attributes: ['postId'],
                }]
            });

            const result = await Posts.findAll({
                include: [{
                    model: Likes,
                    required: true,
                    attributes: ['postId'],
                    where: {
                        userId: userInfo.id
                    }
                },
                {
                    model: Comments,
                    attributes: ['id'],
                    required: true
                }],
                order: [['createAt','DESC']],
                // limit: 10
            });
            // let likeCount = await likes.count({ where: {postId: id} });
            
            if(result.length === 0){
                return res.status(200).json(result);
            }
            else{
                let likesCount:any = [];
                tempLikeCount.map((count:any) => {
                    let { likes } = count;
                    likesCount.push(likes.length);
                })

                const response = result.map((post:any, idx:any) => {
                    let { id, content, createAt, comments } = post;
                    
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
        const userId = req.userId || 2;
        const { postId } = req.query;
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
        else{
            if(!overlapCheck){
                return res.status(200).json({ "message" : "이미 따봉을 취소한 상태입니다." });
            }
            else {
                try{
                    await Likes.destroy({
                        where: {
                            userId: userId,
                            postId : postId
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
