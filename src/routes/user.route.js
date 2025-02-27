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



import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/login").post(loginUser)
router.route("/register").post(registerUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)


router.route("/health").get((req, res) => {
  return res.status(200).json({ message: "Server is healthy" });
});
  

export default router