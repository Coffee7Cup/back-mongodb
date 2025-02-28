import { Admin } from "../models/admin.model"; 

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        const admin = await Admin.findOne({ who: req.user._id });
        if (!admin) {
            return res.status(403).json(new ApiError(403, "You are not authorized to perform this action"));
        }

        req.admin = admin;

        next();
    } catch (error) {
        next(error);
    }
}