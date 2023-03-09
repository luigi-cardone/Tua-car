import express from "express";
import getTowns from '../controllers/townsController.mjs'

const router = express.Router()

router.post('/', getTowns)

export default router