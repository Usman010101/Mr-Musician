import express from "express";
import {verifyToken} from '../middlewares/auth.js';

import {upload,cleanupOnError} from '../middlewares/artistProfile.js'
import {
    updateProfile,
    changePassword,
    deleteAccount,
    updatePaymentSettings,
    getArtistProfile
  } from "../controllers/artistSettings.js";

const router = express.Router();
router.use(verifyToken)


// api/settings/profile
router.post('/profile', upload.single('profileImage'), cleanupOnError, updateProfile);
router.post('/changepassword', changePassword);
router.post('/delete', deleteAccount);
router.post('/payment',updatePaymentSettings)

router.get('/all',getArtistProfile)




export default router;
