import express from "express";
import {getUserCityData, getUserBioData, getUserScheduledTask, updateUserBioData, deleteUser, updateUserCityData, updateSpokiData} from '../controllers/userContoller.mjs'
const router = express.Router({mergeParams: true})

router.get("/user/:user_id", getUserBioData)

router.get("/scheduledTaskUser:user_id", getUserScheduledTask)

router.get("/userCity:user_id", getUserCityData)

router.post("/updateUser", updateUserBioData)

router.post("/updateUserCity", updateUserCityData)

router.post("/updateUserSpoki", updateSpokiData)

router.delete("/deleteUser:userData", deleteUser)

export default router