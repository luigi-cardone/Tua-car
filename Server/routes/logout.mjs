import express from "express";
import handlerLogOut from '../controllers/logoutController.mjs'

const router = express.Router()

router.get('/', handlerLogOut)

export default router