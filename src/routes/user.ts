import express from 'express';
const router = express.Router();
//import userController from '../controllers/user';
import auth from '../middleware/verifyToken';



//router.use(auth)

//router.get('/', userController.userInfo);
//router.patch('/', userController.userPatch);
//router.patch('/area', userController.areaPatch);
//router.delete('/', userController.userDelete);

module.exports = router

export = {}