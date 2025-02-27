import  { User } from '../models/user.model.js';
import {Attendence} from '../models/attendence.model.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {ApiResponse} from '../utils/ApiResponse.js';


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
        subject: record.subject,
        status: record.status
    }));

    return res.status(200).json(new ApiResponse(200, {
        name: student.name,
        uniqueId: student.uniqueId,
        attendence: formattedAttendance
    }, "Attendance fetched successfully"));
};


const getAttendenceOfSubjectInClass = async (req, res) => {
    const { class: className, subject } = req.body;

    if (!className || !subject) {
        return res.status(401).json(new ApiError(400, "Class and subject are required"))
    }

    const students = await User.find({ class: className }, "_id name uniqueId");

    if (!students.length) {
        return res.status(401).json(new ApiError(404, "No students found in this class"))
    }

    const studentIds = students.map(student => student._id);

    const attendenceRecords = await Attendence.find({
        studentId: { $in: studentIds },
        subject: subject
    });

    if (!attendenceRecords.length) {
        return res.status(401).json(new ApiError(404, "No attendance records found for this subject in this class"))
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

const getAttendenceOfStudentInDateInSubject = async (req, res) => {
    const { uniqueId, date, subject } = req.body;

    if (!uniqueId || !date || !subject) {
        return res.status(400).json(new ApiError(400, "Unique Id, date, and subject are required"))
    }

    const attendence = await Attendence.find({
        studentId: mongoose.Types.ObjectId(uniqueId),
        date: date,
        subject
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
//     "class": "10A",
//     "date": "2025-02-17",
//     "subject": "Mathematics",
//     "data": {
//         "STU123": "Present",
//         "STU456": "Present",
//         "STU789": "Absent"
//     }
// }
const reportAttendenceOfClass = async (req, res) => {
    const { class: className, date, course, data } = req.body;

    if (!className || !date || !data || !subject) { 
        return res.status(400).json(new ApiError(400, "Class, date, and attendance data are required"))
    }

    // Find all students in the class
    const students = await User.find({ class: className }, "_id uniqueId name");

    if (!students.length) {
        return res.status(401).json(new ApiError(404, "No students found in this class"))
    }

    // Convert date to proper Date format
    const formattedDate = new Date(date);

    // Create attendance documents for all students
    const attendanceRecords = students.map(student => {
        const status = data[student.uniqueId] || "Absent"; // Default to "Absent" if not provided
        return {
            studentId: student._id,
            date: formattedDate,
            subject: subject, // Assuming subject is passed in the request
            status
        };
    });

    // Insert attendance records into the collection
    await Attendence.insertMany(attendanceRecords);

    return res.status(201).json(new ApiResponse(201, null, "Attendance recorded successfully"));
};

const modifyAttendence = async (req, res) => {
    const { uniqueId, date, subject, status } = req.body;

    if (!uniqueId || !date || !subject || !status) {
        return res.status(401).json(new ApiError(400, "Unique Id, date, subject, and status are required"))
    }

    const student = await User.findOne({ uniqueId }, "_id");

    if (!student) {
        return res.status(401).json(new ApiError(404, "Student not found"))
    }

    const formattedDate = new Date(date);

    const attendanceRecord = await Attendence.findOneAndUpdate(
        { studentId: student._id, date: formattedDate, subject },
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
    getAttendenceOfSubjectInClass,
    getAttendenceOfStudentInDate,
    getAttendenceOfStudentInDateInSubject,
    
    reportAttendenceOfClass,
    modifyAttendence
}