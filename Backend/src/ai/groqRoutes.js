// Backend/src/ai/groqRoutes.js

import express from "express";

import multer from "multer";

import {
  transcribeEmergencyCall,analyzeEmergency
} from "./groqController.js";


const router =
  express.Router();


// ==================================================
// MULTER
// ==================================================

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      // Groq free tier direct upload limit
      fileSize:
        25 * 1024 * 1024,
    },

    fileFilter:
      (req, file, callback) => {
        const allowedTypes = [
          "audio/webm",
          "audio/wav",
          "audio/x-wav",
          "audio/mpeg",
          "audio/mp3",
          "audio/mp4",
          "audio/m4a",
          "audio/ogg",
          "audio/flac",
        ];


        if (
          allowedTypes.includes(
            file.mimetype
          )
        ) {
          callback(
            null,
            true
          );

          return;
        }


        callback(
          new Error(
            `Unsupported audio type: ${file.mimetype}`
          )
        );
      },
  });


// ==================================================
// TRANSCRIBE
// ==================================================

router.post(
  "/transcribe",
  upload.single("audio"),
  transcribeEmergencyCall
);

router.post(
  "/analyze-emergency",
  analyzeEmergency
);


export default router;