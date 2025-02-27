import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Name is required"],
    },
    classCreatedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    students : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    course : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
})

export const Class = mongoose.model("Class", classSchema);