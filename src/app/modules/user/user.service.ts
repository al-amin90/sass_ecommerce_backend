// import status from "http-status";
// import config from "../../config";
// import AppError from "../../errors/AppError";

// import { IUser } from "./user.interface";

// import mongoose from "mongoose";

// const createStudentDateIntoDB = async (
//   password: string,
//   studentDate: TStudent,
// ) => {
//   const user: Partial<IUser> = {};

//   user.password = password || (config.default_password as string);
//   user.role = "student";

//   const admissionSemester = await AcademicSemesterModel.findById(
//     studentDate.admissionSemester,
//   );
//   if (!admissionSemester) {
//     throw new AppError(status.NOT_FOUND, "Admission semester not found");
//   }

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     user.id = await generateStudentId(admissionSemester);
//     const result = await UserModel.create([user], { session });

//     if (!result.length) {
//       throw new AppError(status.BAD_REQUEST, "Faild to create to User");
//     }

//     studentDate.id = result[0].id;
//     studentDate.user = result[0]._id;

//     const result2 = await StudentModal.create([studentDate], { session });
//     if (!result2.length) {
//       throw new AppError(status.BAD_REQUEST, "Faild to create to User");
//     }

//     await session.commitTransaction();
//     await session.endSession();

//     return result2[0];
//   } catch (err) {
//     console.log("err", err);
//     await session.abortTransaction();
//     throw err;
//   } finally {
//     await session.endSession();
//   }
// };

// export default {
//   createStudentDateIntoDB,
// };
