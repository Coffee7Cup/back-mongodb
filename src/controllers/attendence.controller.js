import {Attendence} from '../models/attendence.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import  { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import {Class} from '../models/class.model.js';
import mongoose from 'mongoose';
import {Course} from '../models/course.model.js';
import jwt from 'jsonwebtoken';


const getAttendenceOfSingleStudent = async (req, res) => {
    const { uniqueId } = req.body;

    if (!uniqueId) {
        return res.status(400).json(new ApiError(400, "Unique Id is required"))
    }

    // Find the student by uniqueId to get their ObjectId
    const student = await User.findOne({ uniqueId }, "_id name uniqueId");

    if (!student) {
        return res.status(404).json(new ApiError(404, "Student not found"))
    }

    const attendenceRecords = await Attendence.find({ studentId: student._id });

    if (!attendenceRecords.length) {
        return res.status(401).json(new ApiError(404, "Attendance not found"))
    }

    const formattedAttendance = attendenceRecords.map(record => ({
        date: new Date(record.date).toLocaleDateString("en-GB"), // Formats as dd-mm-yyyy
        course: record.course,
        status: record.status
    }));

    return res.status(200).json(new ApiResponse(200, {
        name: student.name,
        uniqueId: student.uniqueId,
        attendence: formattedAttendance
    }, "Attendance fetched successfully"));
};


const getAttendenceOfCourseInClass = async (req, res) => {
    const { className, course } = req.body;

    if (!className || !course) {
        return res.status(401).json(new ApiError(400, "Class and course are required"))
    }

    const students = await User.find({ class: className }, "_id name uniqueId");

    if (!students.length) {
        return res.status(401).json(new ApiError(404, "No students found in this class"))
    }

    const studentIds = students.map(student => student._id);

    const attendenceRecords = await Attendence.find({
        studentId: { $in: studentIds },
        course: course
    });

    if (!attendenceRecords.length) {
        return res.status(401).json(new ApiError(404, "No attendance records found for this course in this class"))
    }

    const attendence = students.map(student => {
        return {
            name: student.name,
            uniqueId: student.uniqueId,
            attendence: attendenceRecords
                .filter(record => record.studentId.toString() === student._id.toString())
                .map(record => ({
                    date: new Date(record.date).toLocaleDateString("en-GB"), // Formats as dd-mm-yyyy
                    status: record.status
                }))
        };
    });

    return res
        .status(200)
        .json(new ApiResponse(200, attendence, "Attendance fetched successfully"));
};


const getAttendenceOfStudentInDate = async (req, res) => {
    const { uniqueId, date } = req.body;

    if (!uniqueId || !date) {
        return res.status(400).json(new ApiError(400, "Unique Id and date are required"))
    }

    const attendence = await Attendence.find({
        studentId: mongoose.Types.ObjectId(uniqueId),
        date: date
    });

    if (!attendence.length) {
        return res.status(404).json(new ApiError(404, "Attendance not found"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, attendence, "Attendance fetched successfully"));
}

const getAttendenceOfStudentInDateInCourse = async (req, res) => {
    const { uniqueId, date, course } = req.body;

    if (!uniqueId || !date || !course) {
        return res.status(400).json(new ApiError(400, "Unique Id, date, and course are required"))
    }

    const attendence = await Attendence.find({
        studentId: mongoose.Types.ObjectId(uniqueId),
        date: date,
        course
    });

    if (!attendence.length) {
        return res.status(401).json(new ApiError(404, "Attendance not found"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, attendence, "Attendance fetched successfully"));
}

//Expected API Request Body
// {
//     "className": "10A",
//     "date": "2025-02-17",
//     "course": "Mathematics",
//     "data": {
//         "STU123": "Present",
//         "STU456": "Present",
//         "STU789": "Absent"
//     }
// }

const reportAttendenceOfClass = async (req, res) => {
    const { className, date, course, data } = req.body; 

    if (!className || !date || !data || !course) { 
        return res.status(400).json(new ApiError(400, "Class, date, course, and attendance data are required"));
    }

    const classData = await Class.findOne({ name: className }).populate("students", "_id name uniqueId");
    if (!classData || !classData.students.length) {
        return res.status(404).json(new ApiError(404, "No students found in this class"));
    }

    const formattedDate = new Date(date);

    const attendanceRecords = classData.students.map(student => ({
        studentId: student._id,
        date: formattedDate,
        course,
        status: data[student.uniqueId] || "Absent", 
    }));

    try {
        await Attendence.insertMany(attendanceRecords);
        return res.status(201).json(new ApiResponse(201, null, "Attendance recorded successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to record attendance"));
    }
};

const modifyAttendence = async (req, res) => {
    const { uniqueId, date, course, status } = req.body;

    if (!uniqueId || !date || !course || !status) {
        return res.status(401).json(new ApiError(400, "Unique Id, date, course, and status are required"))
    }

    const student = await User.findOne({ uniqueId }, "_id");

    if (!student) {
        return res.status(401).json(new ApiError(404, "Student not found"))
    }

    const formattedDate = new Date(date);

    const attendanceRecord = await Attendence.findOneAndUpdate(
        { studentId: student._id, date: formattedDate, course },
        { status },
        { new: true }
    );

    if (!attendanceRecord) {
        return res.status(401).json(new ApiError(404, "Attendance record not found"))
    }

    return res.status(200).json(new ApiResponse(200, attendanceRecord, "Attendance modified successfully"));
}

export {
    getAttendenceOfSingleStudent,
    getAttendenceOfCourseInClass,
    getAttendenceOfStudentInDate,
    getAttendenceOfStudentInDateInCourse,
    
    reportAttendenceOfClass,
    modifyAttendence
}