import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/config.js";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },

    name: {
        type: String,
        trim: true,
    },

    password: {
        type: String,
        required: true
    },

    dob: {
        type: Date,
    },

    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },

    profilePicture: {
        type: String
    },

    notifications: {
        type: Boolean,
        default: true
    },

    googleId: {
        type: String
    },

    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },

    address: {
        type: String
    },

    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },

    preferences: {
        language: {
            type: String,
            default: 'en'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        }

    },

    loginCount: {
        type: Number,
        default: 0
    },

    refreshToken: {
        type: String,
    }

},
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, Number(config.BCRYPT_SALT_ROUNDS));
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
        throw new Error("Password or hash is missing.");
    }
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

export const User = mongoose.model("User", userSchema);
