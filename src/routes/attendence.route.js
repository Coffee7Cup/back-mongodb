import { Router } from "express";

import {
    getAttendenceOfSingleStudent,
    getAttendenceOfCourseInClass,
    getAttendenceOfStudentInDate,
    getAttendenceOfStudentInDateInCourse,
    
    reportAttendenceOfClass,
    modifyAttendence
} from "../controllers/attendence.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isCourseCreater } from "../middlewares/isCourseCreater.middleware.js";

const router = Router()

//update Attendence Routes
router.route("/update-attendence").post(verifyJWT, isCourseCreater, reportAttendenceOfClass)
router.route("/modify-attendence").patch(verifyJWT, isCourseCreater, modifyAttendence)

//get Attendence Routes
router.route("/get-attendence").get(verifyJWT, getAttendenceOfSingleStudent)
router.route("/get-attendence-course").get(verifyJWT,  getAttendenceOfCourseInClass)
router.route("/get-attendence-date").get(verifyJWT, getAttendenceOfStudentInDate)
router.route("/get-attendence-date-subject").get(verifyJWT, getAttendenceOfStudentInDateInCourse)
