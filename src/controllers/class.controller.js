import  { User } from '../models/user.model.js';
import {Attendence} from '../models/attendence.model.js';
import {Course} from '../models/course.model.js';
import {Class} from '../models/class.model.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {ApiResponse} from '../utils/ApiResponse.js';

const createClass = async (req, res) => {
    const { name, course, students } = req.body;

    if (!name || !course || !students) {
        return res.status(400).json(new ApiError(400, "Name, course, and students are required"));
    }

    const isNameExists = await Class.findOne({ name,});

    if (isNameExists) {
        return res.status(400).json(new ApiError(400, "Class name already exists"));
    }

    try {
        const classData = new Class({
            name,
            course,
            students,
            classCreatedBy: req.user._id,
        });

        await classData.save();

        return res.status(201).json(new ApiResponse(201, classData, "Class created successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to create class"));
    }
}

const fetchClassDetails = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json(new ApiError(400, "Name is required"));
    }

    try {
        const classData = await Class.findOne({ name }).populate("students");

        if (!classData) {
            return res.status(404).json(new ApiError(404, "Class not found"));
        }

        return res.status(200).json(new ApiResponse(200, classData, "Class fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to fetch class"));
    }
}

const modifyClassDetails = async (req, res) => {
    const { className, name, course, students } = req.body;

    if (!className || !name || !course || !students) {
        return res.status(400).json(new ApiError(400, "Class name, new name, course, and students are required"));
    }

    try {
        const classData = await Class.findOneAndUpdate(
            { name: className }, // Find by class name
            {
                $set: {
                    name, // Update name
                    course,
                    students,
                },
            },
            { new: true, runValidators: true } // Return updated document & enforce validation
        );

        if (!classData) {
            return res.status(404).json(new ApiError(404, "Class not found"));
        }

        return res.status(200).json(new ApiResponse(200, classData, "Class updated successfully"));
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json(new ApiError(500, "Failed to update class"));
    }
};

const deleteClass = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json(new ApiError(400, "Name is required"));
    }

    try {
        const classData = await Class.findOneAndDelete({ name });

        if (!classData) {
            return res.status(404).json(new ApiError(404, "Class not found"));
        }

        return res.status(200).json(new ApiResponse(200, classData, "Class deleted successfully"));
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json(new ApiError(500, "Failed to delete class"));
    }
};


export{
    createClass,
    fetchClassDetails,
    modifyClassDetails,
    deleteClass
}