import express from "express";
import deleteSchedule from '../controllers/deleteScheduleTaskController.mjs'

const router = express.Router()

router.post('/', deleteSchedule)

export default router