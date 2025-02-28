import  { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'
import {ApiResponse} from '../utils/ApiResponse.js'

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        return res.status(500).json(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = async (req, res) => {
    const { uniqueId, name, email, password, section } = req.body
    if(!uniqueId || !name || !email || !password || !section) {
        return res.status(400).json(new ApiError(400, "All fields are required"))
    }

    const isExisting = await User.findOne(
        { $or: [ { uniqueId }, { email } ] }
    )
    if(isExisting) {
        return res.status(400).json(new ApiError(400, "User already exists -> uniqueId or email already exists"))
    }

    const user = await User.create({
        uniqueId, name, email, password, section
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) {
        return res.status(500).json(new ApiError(500, "Something went wrong while creating user"))
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"))
}

const loginUser = async (req, res) => {
    const {email, password, uniqueId} = req.body
    if ((!email && !uniqueId) || !password) {
        return res.status(400).json(new ApiError(400, "Email or Unique ID and password are required"));
    }

    const user = await User.findOne({ $or: [ { email }, { uniqueId } ] })

    if(!user) {
        return res.status(400).json(new ApiError(404, "User not found"))
    }

    const isValid = await user.isPasswordCorrect(password)

    if(!isValid) {
        return res.status(400).json(new ApiError(401, "Invalid credentials"))
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
}

const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
}

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res.status(401).json(new ApiError(401, "unauthorized request"))
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            return res.status(401).json(ApiError(401, "Invalid refresh token"))
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(500).json(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        return res.status(401).json(new ApiError(401, error?.message || "Invalid refresh token"))
    }

}

const getCurrentUser = async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
}

const updateAccountDetails = async(req, res) => {
    const {name} = req.body

    if (!email) {
        return res.status(400).json(new ApiError(400, "All fields are required"))
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
};

const changeCurrentPassword = async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        return res.status(400).json(new ApiError(400, "Invalid old password"))
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
}


export {
    registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    getCurrentUser, 
    updateAccountDetails, 
    changeCurrentPassword,
}