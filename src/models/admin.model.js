import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    who : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    },
})

export const Admin = mongoose.model('Admin', adminSchema);