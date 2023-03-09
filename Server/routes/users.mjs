import express from "express";
import getUsers from "../controllers/usersController.mjs";

const router = express.Router()

router.get('/', getUsers)

export default router