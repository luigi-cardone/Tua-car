import express from "express";
import deleteSchedule from '../controllers/deleteScheduleTaskController.js'

const router = express.Router()

router.post('/', deleteSchedule)

export default router