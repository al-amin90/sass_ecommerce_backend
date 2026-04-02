// import { Router } from 'express'
// import userController from './user.controller'
// import { createStudentValidationSchema } from '../student/student.validate'
// import validateRequest from '../../middlewares/validateRequest'
// import { createFacultyValidationSchema } from '../faculty/faculty.validate'
// import { createAdminValidationSchema } from '../admin/admin.validate'
// import auth from '../../middlewares/auth'
// import { USER_ROLE } from './user.constant'

// const router = Router()

// router.post(
//   '/create-student',
//   auth(USER_ROLE.admin, USER_ROLE.faculty),
//   validateRequest(createStudentValidationSchema),
//   userController.createStudent,
// )

// router.post(
//   '/create-faculty',
//   validateRequest(createFacultyValidationSchema),
//   userController.createFaculty,
// )

// router.post(
//   '/create-admin',
//   validateRequest(createAdminValidationSchema),
//   userController.createAdmin,
// )

// const userRouter = router
// export default userRouter
