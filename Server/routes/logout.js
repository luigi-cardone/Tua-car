import express from "express";
import handlerLogOut from '../controllers/logoutController.js'

const router = express.Router()

router.get('/', handlerLogOut)

export default router