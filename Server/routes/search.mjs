import express from "express";
import doSearch from '../controllers/doSearchController.mjs'

const router = express.Router()

router.post('/', doSearch)

export default router