import express from "express";
import handleNewUser from '../controllers/registerController.mjs'

const router = express.Router()

router.post('/', handleNewUser)

export default router