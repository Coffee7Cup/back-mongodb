import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.route.js'
import attendenceRouter from './routes/attendence.route.js'
import courseRouter from './routes/course.route.js'
import classRouter from './routes/class.route.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/attendence", attendenceRouter)
app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/classes", classRouter)

// http://localhost:8000/api/v1/users/register

export { app }