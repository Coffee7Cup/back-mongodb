import { ApiError } from "../utils/ApiError.js";

export const isAllowed = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }
        
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        next(error);
    }
};
