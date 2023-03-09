import express from "express";
import doSearch from '../controllers/doSearchController.js'

const router = express.Router()

router.post('/', doSearch)

export default router