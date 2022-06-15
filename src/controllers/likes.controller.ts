import { Likes } from "../models/likes.model";
import { Users } from "../models/users.model";
import sequelize from '../models';

import { Request, Response } from 'express';
import { Posts } from "../models/posts.model";
interface userIdInRequest extends Request {
    userId?:number
}

export const likesUser = async (req:userIdInRequest,  res: Response) => {
      
        let userInfo = await Users.findOne({
            where: {
                id: req.userId
            }
        });
        
        if(!userInfo){
            res.status(401).json({ "message" : "token doesn't exist" });
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

            if(likeUserResult.length === 0){
                return res.status(200).json(likeUserResult);
            }
            else{
                const responseMapFunction = (post:any) => {let { id, content, createAt, likeCount, CommentCount } = post;
                return {
                    id: id,
                    content: content,
                    createAt: createAt,
                    likeCount: likeCount,
                    commentCount: CommentCount
                };}
                const response = likeUserResult.map(responseMapFunction);
                return res.status(200).json(response);
            };
        };
    };

    export const likesCreate = async (req:userIdInRequest,  res: Response) => {
       
        const userId = Number(req.userId);
        const { postId } = req.body;
        let userInfo = await Users.findOne({
            where: {
                id: req.userId
            }
        });
        let overlapCheck = await Likes.findOne({
            where: {
                userId: req.userId,
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
                });
                res.status(201).json({ "message" : "created" });
            }
            else{
                res.status(200).json({ "message" : "이미 따봉을 한 상태입니다." });
            };
        };
    };

    export const likesDelete = async (req:userIdInRequest,  res: Response) => {
        
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
                };
            };
        };
    };
