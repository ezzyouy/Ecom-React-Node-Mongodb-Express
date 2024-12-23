import express from "express";
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import multer from "multer";
import { isAdmin, isAuth } from "../utils.js";



const upload = multer();
const uploadRouter = express.Router();

uploadRouter.post('/', isAuth, isAdmin, upload.single('file'), async (req, res) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const stremUpload = (req) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    PromiseRejectionEvent(error);
                }
            })
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        })
    };
    const result= await stremUpload(req);
    res.send(result)
});

export default uploadRouter;