const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/verifyToken')

router.use(auth)

router.get()
router.patch()
router.patch()
router.delete()

module.exports = router