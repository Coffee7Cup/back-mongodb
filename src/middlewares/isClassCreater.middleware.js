import { ApiError } from "../utils/ApiError.js";
import { Class } from "../models/class.model.js";

export const isClassCreator = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        const classData = await Class.findOne({ name: req.body.className }); 
        if (!classData) {
            return res.status(404).json(new ApiError(404, "Class not found"));
        }

        if (!classData.classCreatedBy.equals(req.user._id)) { 
            return res.status(403).json(new ApiError(403, "You are not authorized to perform this action"));
        }

        req.classData = classData;

        next(); 
    } catch (error) {
        next(error);
    }
};
