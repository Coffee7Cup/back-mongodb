import {Router} from 'express';
import {
  createClass,
  fetchClassDetails,
  modifyClassDetails,
  deleteClass
} from '../controllers/class.controller.js';

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {isClassCreator} from '../middlewares/isClassCreater.middleware.js';
import {isCourseCreater} from '../middlewares/isCourseCreater.middleware.js';
import {isAdmin} from '../middlewares/isAdmin.middleware.js';

const router = Router();

router.route("/create").post(verifyJWT,isAdmin , createClass);
router.route("/fetch").get(verifyJWT, fetchClassDetails);
router.route("/modify").patch(verifyJWT, isCourseCreater, modifyClassDetails);
router.route("/delete").delete(verifyJWT, isAdmin, deleteClass);