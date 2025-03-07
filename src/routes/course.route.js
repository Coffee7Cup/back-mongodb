import {Router} from 'express';
import {
    createCourse,
    fetchCourseDetails,
    modifyCourseDetails,
    deleteCourse,
} from '../controllers/course.controller.js';

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {isClassCreator} from '../middlewares/isClassCreater.middleware.js';
import {isCourseCreater} from '../middlewares/isCourseCreater.middleware.js';
import {isAdmin} from '../middlewares/isAdmin.middleware.js';

const router = Router();

router.route("/create").post(verifyJWT, isAdmin, createCourse);
router.route("/fetch-details").get(verifyJWT, fetchCourseDetails);  
router.route("/modify").patch(verifyJWT, isCourseCreater, modifyCourseDetails);
router.route("/delete").delete(verifyJWT, isAdmin, deleteCourse);