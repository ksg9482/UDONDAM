import { Users } from "../models/users.model"; 

export const userInfo = async (req:any,  res:any) => { 
    
    try {
        const userInfo:any = await Users.findOne({
        attributes: [['id','userId'],'email', 'nickname', 'area', 'area2', 'socialType', 'manager'],
        where: { id: req.userId }
        })
        
        return res.status(200).json(userInfo);
    } catch(err) {
        //console.log(err);
        return res.status(500).json({ "message": "Server Error"});
    }
};

export const userPatch = async (req:any,  res:any) => {
    
        const {nickname, password} = req.body;
        try{
            if(!nickname && !password) {
                return res.status(400).json({"message": "no data has been sent!"})
            }
            if(nickname && password) {
                await Users.update({
                nickname: nickname,
                password: password
                },
                {
                where: {id: req.userId}
                })
                return res.status(200).json({"message": "user patched!"})
            } 
            else if(nickname) {
                await Users.update({
                    nickname: nickname
                },
                {
                    where: {id: req.userId}
                })
                return res.status(200).json({"message": "nickname patched!"})
            }
            else if(password) {
                await Users.update({
                    password: password
                },
                {
                    where: {id: req.userId}
                })
                return res.status(200).json({"message": "password patched!"})
            }    
        } catch(err) {
            //console.log(err);
            return res.status(500).json({"message": "Server Error"})
        }
    };

    export const areaPatch = async (req:any,  res:any) => {
        
        const {area, area2} = req.body;
        try{
            if(!area && !area2) {
                return res.status(400).json({"message": "no data has been sent!"})
            }
            if(area) {
                const patchCheck:any = await Users.update({
                    area : area
                },
                {
                where: {
                    id: req.userId
                }
                })
                
            const userInfo:any = await Users.findOne({
                attributes:['area'],
                where:{
                    id: req.userId
                },
                raw:true
            })
            res.status(200).json(userInfo)
        }
        else if(area2) {
            const patchCheck:any = await Users.update({
                area2 : area2
            },
            {
                where: {
                    id: req.userId
                }
            })
            
            const userInfo:any = await Users.findOne({
                attributes:['area2'],
                where:{
                    id: req.userId
                },
                raw:true
            })
            res.status(200).json(userInfo)
        }
        } catch(err) {
            //console.log(err);
            return res.status(500).json({"message": "Server Error"})
        }
    };
    
    export const userDelete = async (req:any,  res:any) => {
              
        try{
            await Users.destroy({
            where: {id: req.userId}
        })
            return res.status(200).clearCookie('jwt').json({"message" : 'delete!'})  
        } catch(err) {
            //console.log(err);
            return res.status(500).json({"message" : "Server Error"});
        }
    };
    
