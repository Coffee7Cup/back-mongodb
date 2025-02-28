import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Name is required"],
        unique : true,
    },
    code : {
        type: String,
        required: [true, "Code is required"],
        unique : true,
    },
    courseCreatedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    schedule: [
        {
            day: {
                type: String,
                required: [true, "Day is required"],
            },
            time: {
                type: String,
                required: [true, "Time is required"],
            },
        }
    ]
})

export const Course = mongoose.model("Course", courseSchema);