import { ApiError } from "../../server/utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../../server/models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized Request: No Access Token Provided");
    }

    let decodedInfo;
    try {
      decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(401, "Access Token Expired");
      }
      throw new ApiError(401, "Invalid Access Token");
    }

    const user = await User.findById(decodedInfo?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid JWT Access Token");
    }

    req.user = user; // Attach user object to the request
    next();
  } catch (error) {
    console.error(`[Auth Error]: ${error.message}`); // Optional: Log errors
    next(new ApiError(401, error.message || "Invalid Access Token"));
  }
};
