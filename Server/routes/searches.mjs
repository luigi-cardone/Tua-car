import express from "express";
import getSearchesHistory from '../controllers/searchesController.mjs'

const router = express.Router()

router.get('/:user_id', getSearchesHistory)

export default router