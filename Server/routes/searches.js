import express from "express";
import getSearchesHistory from '../controllers/searchesController.js'

const router = express.Router()

router.get('/:user_id', getSearchesHistory)

export default router