import express from "express";
import {getRegions, getStateFromRegion, getCityFromState, getLocationFromZip} from '../controllers/geoDataController.mjs'

const router = express.Router()

router.get("/regions", getRegions)


router.get("/provincesByregion:id", getStateFromRegion)

router.get("/townsByProvince:province_sigla", getCityFromState)

router.get("/infoByZip:zip", getLocationFromZip)

export default router