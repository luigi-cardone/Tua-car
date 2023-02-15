import express from "express";
import getTowns from '../controllers/townsController.js'

const router = express.Router()

router.post('/', getTowns)

export default router