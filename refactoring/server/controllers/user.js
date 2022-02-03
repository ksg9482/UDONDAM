const {user} = reqire('../models/index');

module.exports = {
    userInfo : async(req,res) => {
        req.userId = req.userId
        try {
            const userInfo = await user.findOne({
                attributes:[['id','userId'],'email', 'nickname', 'area', 'area2', 'socialType', 'manager'],
                where:{id:req.userId}
            })
            return res.status(200).json(userInfo)
        } catch (error) {
            return res.status(500).json({"message":"Server Error"})
        }
    },

    userPatch : async(req,res) => {
        req.userId = req.userId;
        const {nickname, password} = req.body;
        try {
            if(nickname && password) {
                await user.update({
                    nickname: nickname,
                    password: password
                },{
                    where: {id:req.userId}
                })
                return res.status(200).json({"message": "nickname and password patched!"})
            }
            else if(nickname) {
                await user.update({
                    nickname: nickname
                },
                {
                    where: {id: req.userId}
                })
                return res.status(200).json({"message": "nickname patched!"})
            }
            else if(password) {
                await user.update({
                    password: password
                },
                {
                    where: {id: req.userId}
                })
                return res.status(200).json({"message": "password patched!"})
            }    
        } catch (error) {
            return res.status(500).json({"message":"Server Error"})
        }
    },

    areaPatch: async(req,res) =>{
        req.userId = req.userId;
        const {area, area2} = req.body;
        try {
            if(area){
                const patchCheck = await user.update({
                    area : area
                },
                {
                where: {
                    id: req.userId
                }
                }) 

                const userInfo = await user.findOne({
                    attributes: ['area'],
                    where: {
                        id: req.userId
                    },
                    raw:true
                })
                res.status(200).json(userInfo) //return문을 쓰면 종료되기에 안섰음.

            } else if(area2){
                const patchCheck = await user.update({
                    area2 : area2
                },
                {
                    where: {
                        id: req.userId
                    }
                })
                // if(!patchCheck) {
                //     return res.status(400).json({"message": "area2 checked!"})
                // }
                const userInfo = await user.findOne({
                    attributes:['area2'],
                    where:{
                        id: req.userId
                    },
                    raw:true
                })
                res.status(200).json(userInfo) //return문을 쓰면 종료되기에 안섰음.
            }
            
        } catch (error) {
            return res.status(500).json({"message": "Server Error"})
        }
    },

    userDelete: async(req, res)=>{
        req.userId = req.userId;

        try {
            await user.destroy({
                where: {id: req.userId}
            })
            return res.status(200).clearCookie('jwt').json({"message" : 'delete!'}) 
        } catch (error) {
            return res.status(500).json({"message": "Server Error"})
        }
    }
//end
}