//import express from "express";
import { Users } from "../models/users.model";
import { RecentSearchs } from "../models/recentsearchs.model";
//예약어 위험!! 바꾸기!!
export const get = async(req:any,  res:any) => {
    const userId = req.userId || 2;
    let userInfo:any = await Users.findOne({
        where: {
            id: userId
        }
    });
    const recent = await RecentSearchs.findAll({
        attributes:['id','userId','tag','notTag'],
        where:{
            userId: userId
        },
        order: [['createAt','DESC']],
        limit: 3
    });
    if(!userInfo){
        res.status(401).json({ "message" : "token doesn't exist" });
    }
    else {
        if(recent.length === 0){
            return res.status(200).json(recent);
        }
        else {
            const result = recent.map((el:any,idx:any) =>{
                const { tag, notTag, createAt } = el;
                if(notTag !== null){
                    return {
                        id: idx+1,
                        tag: tag.split(','),
                        notTag: notTag.split(','),
                        createAt: createAt
                    };
                }
                else{
                    return {
                        id: idx+1,
                        tag: tag.split(','),
                        notTag: null,
                        createAt: createAt
                    };
                }
            });
            return res.status(200).json(result);
        }
    }
};

export const post = async(req:any,  res:any) => {
    const userId = req.userId || 2;
    const { tag, notTag } = req.body;
    let stringNotTag = null;
    if(notTag !== null){
        stringNotTag = notTag.join();
    }
    const stringTag = tag.join();
    let userInfo = await Users.findOne({
        where: {
            id: userId
        }
    });
    if(!userInfo){
        res.status(401).json({ "message" : "token doesn't exist" });
    }
    else {
        const recent:any = await RecentSearchs.findAll({
            attributes:['id','userId','tag','notTag'],
            where:{
                userId: userId
            },
            order: ['createAt']
        });

        if(recent.length > 3){
            
            await RecentSearchs.destroy({
                where: {
                    id: recent[0].id,
                }
            });
        }

        let overlapCheck:any = await RecentSearchs.findOne({
            attributes: ['id'],
            where: {
                userId: userId,
                tag: stringTag,
                notTag: stringNotTag
            }
        });

        if(overlapCheck){
            try {
                await RecentSearchs.destroy({
                    where: {
                        id: overlapCheck.id
                    }
                });
                await RecentSearchs.create({
                    userId: userId,
                    tag: stringTag,
                    notTag: stringNotTag
                });
                res.status(200).json({ "message" : "recentsearch created" });
            }
            catch(err) {
                //console.log(err);
                return res.status(500).json({ "message" : "Server Error" });
            }
        }
        else{
            await RecentSearchs.create({
                userId: userId,
                tag: stringTag,
                notTag: stringNotTag
            });
            res.status(200).json({ "message" : "recentsearch created" });
        }
    };
    
}