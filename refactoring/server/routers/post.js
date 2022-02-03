const express = require('express')
const router = express.Router()
const postController = require('../controllers/post')
const auth = require('../middleware/verifyToken')

router.use(auth)

router.get('/',postController.postTag);
router.get('/user')
router.get('/:postId')
router.post('/')
router.delete('/:postId')

module.exports = router