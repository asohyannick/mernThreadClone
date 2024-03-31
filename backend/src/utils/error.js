export const errorHandler = (StatusCode, message) => {
    const error = new Error();
    error.StatusCode = StatusCode;
    error.message = message;
    return error;
};
