import { ApiError } from "../utils/ApiError.js";
import { Class } from "../models/class.model.js"; 
import { Course } from "../models/course.model.js";

export const isCourseCreater = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        const course = await Course.findOne({name: req.body.course})
        if (!course) {
            return res.status(404).json(new ApiError(404, "Course not found"));
        }

        if(course.courseCreatedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json(new ApiError(403, "You are not authorized to perform this action"));
        }

        req.course = course;
        
        next(); 
    } catch (error) {
        next(error);
    }
};
