import express from 'express';
const router = express.Router();
import { registerUser, registerDetails, getUsers, checkUsername, returnUser, loginUser, logoutUser, verifyOtp } from '../controllers/user.controller.js';
import upload from '../../boilerplate/middleware/multer.js';
import { verifyJWT } from '../../boilerplate/middleware/auth.middleware.js';
import { getUserFromJWT } from '../../boilerplate/middleware/getuserfromjwt.js';
import RateLimiter from '../../boilerplate/middleware/express-rate-limit.js'

router.route('/register').post(registerUser)
router.route('/check-username').post(checkUsername)
router.route('/registerDetails').post(upload.single('profilePic'), registerDetails)
router.route('/getUser').get(getUserFromJWT, returnUser)
router.route('/login').post(RateLimiter, loginUser)
router.route('/verify-otp').post(verifyOtp)
router.route('/get-chats').post(getUserFromJWT, getUsers)

export default router;