import express from "express";
import refreshTokenController from '../controllers/refreshTokenController.mjs'

const router = express.Router()

router.get('/', refreshTokenController)

export default router