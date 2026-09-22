// Backend/src/ai/groqController.js

import {
  transcribeAudio,
  analyzeEmergencyTranscript
} from "./groqService.js";




// ==================================================
// TRANSCRIBE EMERGENCY CALL
// ==================================================

export async function transcribeEmergencyCall(
  req,
  res
) {
  try {
    // -----------------------------------------------
    // Check uploaded file
    // -----------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,

        message:
          "Audio file is required.",
      });
    }


    console.log(
      "\n🎙️ AUDIO RECEIVED"
    );

    console.log(
      "File:",
      req.file.originalname
    );

    console.log(
      "Mime:",
      req.file.mimetype
    );

    console.log(
      "Size:",
      req.file.size,
      "bytes"
    );


    // -----------------------------------------------
    // Send audio to Groq
    // -----------------------------------------------

    const transcription =
      await transcribeAudio(
        req.file.buffer,

        req.file.originalname,

        req.file.mimetype
      );


    console.log(
      "\n🧠 GROQ TRANSCRIPTION"
    );

    console.log(
      transcription.text
    );


    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Audio transcribed successfully.",

      transcription,
    });
  }

  catch (error) {
    console.error(
      "\n❌ GROQ TRANSCRIPTION ERROR"
    );

    console.error(
      error.message
    );


    return res.status(500).json({
      success: false,

      message:
        "Failed to transcribe emergency call.",

      error:
        error.message,
    });
  }
}

export async function analyzeEmergency(req, res) {
  try {
    const { transcript } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required."
      });
    }

    console.log("\n========== EMERGENCY AI ANALYSIS ==========");
    console.log("Transcript:", transcript);

    const analysis =
      await analyzeEmergencyTranscript(transcript);

    console.log("AI Analysis:", analysis);
    console.log("===========================================\n");

    return res.status(200).json({
      success: true,
      message: "Emergency transcript analyzed successfully.",
      analysis
    });

  } catch (error) {
    console.error(
      "Emergency analysis controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to analyze emergency transcript."
    });
  }
}