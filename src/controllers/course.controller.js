import  { User } from '../models/user.model.js';
import {Attendence} from '../models/attendence.model.js';
import {Course} from '../models/course.model.js';
import {Class} from '../models/class.model.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {ApiResponse} from '../utils/ApiResponse.js';

const createCourse = async (req, res) => {
    const { name, code, schedule } = req.body;

    if (!name || !code || !schedule) {
        return res.status(400).json(new ApiError(400, "Name, code, and schedule are required"));
    }

    const isNameExists = await Course.findOne({ name });
    if (isNameExists) {
        return res.status(400).json(new ApiError(400, "Course name already exists"));
    }

    try {
        const course = new Course({
            name,
            code,
            courseCreatedBy: req.user._id,
            schedule
        });

        await course.save();

        return res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to create course"));
    }
};

const fetchCourseDetails = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json(new ApiError(400, "Name is required"));
    }

    try {
        const course = await Course.findOne
        ({ name }).populate("shedule");

        if (!course) {
            return res.status(404).json(new ApiError(404, "Course not found"));
        }

        return res.status(200).json(new ApiResponse(200, course, "Course fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to fetch course"));
    }
}

const getCoursesOfUser = async (req, res) => {
    try {
        const user = req.user;
        const courses = await Course.find({ courseCreatedBy: user._id });
        return res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to fetch courses"));
    }
}

const modifyCourseDetails = async (req, res) => {
    const { courseName, name, code, schedule } = req.body;

    if (!courseName || !name || !code || !schedule) {
        return res.status(400).json(new ApiError(400, "Course name, new name, code, and schedule are required"));
    }

    try {
        const course = await Course.findOneAndUpdate(
            { name: courseName }, // Find by course name
            {
                $set: {
                    name, // Update name
                    code,
                    schedule,
                },
            },
            { new: true, runValidators: true } // Return updated document & enforce validation
        );

        if (!course) {
            return res.status(404).json(new ApiError(404, "Course not found"));
        }

        return res.status(200).json(new ApiResponse(200, course, "Course updated successfully"));
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json(new ApiError(500, "Failed to update course"));
    }
}


const deleteCourse = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json(new ApiError(400, "Name is required"));
    }

    try {
        const course = await Course.findOneAndDelete({ name });

        if (!course) {
            return res.status(404).json(new ApiError(404, "Course not found"));
        }

        return res.status(200).json(new ApiResponse(200, course, "Course deleted successfully"));
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json(new ApiError(500, "Failed to delete course"));
    }
}

export {
    createCourse,
    fetchCourseDetails,
    getCoursesOfUser,
    modifyCourseDetails,
    deleteCourse
}