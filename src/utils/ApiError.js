class ApiError {
    constructor(statusCode, data, message = "Fail"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
    }
}

export {ApiError}