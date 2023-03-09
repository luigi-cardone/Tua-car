import express from "express";
import setScheduleSearch from '../controllers/doScheduledSearch.js'

const router = express.Router()

router.post('/', setScheduleSearch)

export default router