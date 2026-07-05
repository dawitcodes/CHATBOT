// import { StatusCodes } from "http-status-codes";

export const errorHandler = (err, req, res, next) => {
  return res.status(err.status || 500).json({
    status: false,
    message: err.message|| "something went wrong try again later",
  });
};

// const errorHandler = (err, req, res, next) => {
//   const statusCode = err.status || 500;

//   res.status(statusCode).json({
//     message: err.message || "Internal Server Error",
//   });
// };

// export default errorHandler;