// This code defines a custom error class called AppError that extends the built-in Error class in JavaScript.
class AppError extends  Error{
    constructor(message, statusCode){
        super(message); // Call the parent constructor with the message
        this.statusCode=statusCode;
    }
}

module.exports=AppError; 

