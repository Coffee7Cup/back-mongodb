import { Router } from "express";
import { 
    registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    getCurrentUser, 
    updateAccountDetails, 
    changeCurrentPassword,
} from "../controllers/user.controller.js";

import {
  getAttendenceOfSingleStudent,
  getAttendenceOfSubjectInClass,
  getAttendenceOfStudentInDate,
  getAttendenceOfStudentInDateInSubject,

  reportAttendenceOfClass,
  modifyAttendence,
} from "../controllers/attendence.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAllowed } from "../middlewares/isAllowed.middleware.js";


const router = Router()


router.route("/login").post(loginUser)
router.route("/register").post(registerUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

//update Attendence Routes
router.route("/update-attendence").post(verifyJWT,isAllowed, reportAttendenceOfClass)
router.route("/modify-attendence").patch(verifyJWT,isAllowed, modifyAttendence)

//get Attendence Routes
router.route("/get-attendence").get(verifyJWT, getAttendenceOfSingleStudent)
router.route("/get-attendence-subject").get(verifyJWT, getAttendenceOfSubjectInClass)
router.route("/get-attendence-date").get(verifyJWT, getAttendenceOfStudentInDate)
router.route("/get-attendence-date-subject").get(verifyJWT, getAttendenceOfStudentInDateInSubject)

router.route("/health").get((req, res) => {
  return res.status(200).json({ message: "Server is healthy" });
});
  

export default router