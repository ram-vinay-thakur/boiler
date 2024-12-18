import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import redisClient from '../redis/redisClient.js';
import cloudinary from '../config/configCloudinary.js';
import sendOtpEmail from '../utils/sendMail.js';
import crypto from 'crypto';
import generateCookieOption from '../config/cookieConfig.js';

const registerUser = async (req, res, next) => {
    try {
        const { username, password, email, name } = req.body;

        const ifExistUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (ifExistUser) {
            const conflictField = ifExistUser.username === username ? "Username" : "Email";
            throw new ApiError(409, `${conflictField} already exists!`);
        }

        const newUser = {
            username,
            password,
            email,
            name,
        };

        const redisKey = `newUser:${username}`;

        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        function generateSecureOtp() {
            const otp = crypto.randomInt(100000, 1000000);
            return otp.toString();
        }

        const otp = generateSecureOtp();
        sendOtpEmail(email, otp);
        const userWithOtp = { ...newUser, otp };
        await redisClient.set(redisKey, JSON.stringify(userWithOtp), { EX: 1800 });


        return res.status(201).json(new ApiResponse(201, {
            message: 'User registered temporarily in Redis. Please complete the registration.',
            user: { username, email, name, redisKey },
        }, ''));

    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Error Registering User!',
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { otp, redisKey, email } = req.body;
        const Jsonuser = await redisClient.get(redisKey);

        if (!Jsonuser) {
            return new ApiError(404, 'User not found in Redis!');
        }
        const user = JSON.parse(Jsonuser)
        if (user.otp != otp) {
            return new ApiError(400, 'Invalid OTP!')
        };

        const userDoc = {
            username: user.username,
            password: user.password, 
            email: user.email,
            name: user.name,
        };

        const newUser = await User.create(userDoc);

        const accessToken = newUser.generateAccessToken(); 
        const refreshToken = newUser.generateRefreshToken(); 

        newUser.refreshToken = refreshToken;
        await newUser.save();


        res.cookie('refreshToken', refreshToken, generateCookieOption(true, "Strict", 7 * 24 * 60 * 60 * 1000));
        res.cookie('accessToken', accessToken, generateCookieOption(true, "Strict", 2 * 60 * 60 * 1000));        

        const { password, refreshToken: _, ...filteredUser } = newUser.toObject();
        return res.status(200).json(
            new ApiResponse(200, {
                user: filteredUser,
                accessToken,
            }, "Login Successful")
        );
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Error Registering User!',
        });
    }
}

const checkUsername = async (req, res) => {
    try {
        const { username } = req.body;

        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json(new ApiResponse(400, { status: false }));
        }

        return res.status(200).json(new ApiResponse(200, { status: true }));
    } catch (error) {
        console.error(error);
        return new ApiError(500, "Error Registering Details!")
    }
}

const returnUser = (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, { user: req.user }));
    } catch (error) {
        console.error(error);
        return new ApiError(500, "Error Returning Details!")
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(new ApiResponse(400, "Username and password are required.", { status: false }));
        }

        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });

        if (!user) {
            return res.status(400).json(new ApiResponse(400, "User doesn't exist!", { status: false }));
        }

        const isCorrect = await user.isPasswordCorrect(password);
        if (!isCorrect) {
            return res.status(400).json(new ApiResponse(400, "Incorrect password!", { status: false }));
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        delete userWithoutPassword.refreshToken;

        res.cookie('refreshToken', refreshToken, generateCookieOption(true, "Strict", 7 * 24 * 60 * 60 * 1000));
        res.cookie('accessToken', accessToken, generateCookieOption(true, "Strict", 2 * 60 * 60 * 1000));        

        return res.status(200).json(new ApiResponse(200, "Login successful", { user: userWithoutPassword, token: accessToken }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiError(500, "Error logging in!"));
    }
};

const logoutUser = async (req, res) => {
    try {
        const user = req.user._id;
        const userinDB = User.findByIdAndUpdate(user,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        );

        const cookieOption = generateCookieOption(true)

        return res
            .status(200)
            .clearCookie("refreshToken", cookieOption)
            .json(new ApiResponse(200, {}, "User Logged Out Successfully!"))
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiError(500, "Error Logging out!"));
    }
}

export { registerUser, checkUsername, returnUser, loginUser, logoutUser, verifyOtp };
