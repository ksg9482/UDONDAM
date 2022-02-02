const {user} = reqire('../models/index');

module.exports = {
    userinfo : async(req,res) => {
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
        
    }
}