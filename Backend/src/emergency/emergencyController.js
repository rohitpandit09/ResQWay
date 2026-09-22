// Backend/src/emergency/emergencyController.js

import multer from "multer";

import {
  createEmergencySession,
  startEmergencySession,
  getEmergencySession,
  cancelEmergencySession,
} from "./emergencyService.js";

import {
  buildTelemetry,
} from "../simulation/telemetryEngine.js";

import {
  transcribeAudio,
  analyzeEmergencyTranscript,
} from "../ai/groqService.js";


// ==================================================
// MULTER CONFIGURATION
// ==================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});


// ==================================================
// CREATE + START EMERGENCY
// ==================================================

export function createEmergency(req, res) {
  try {
    const {
      callerId,
      driverId,
      callerNode,
    } = req.body;


    // -----------------------------------------------
    // Basic validation
    // -----------------------------------------------

    if (!callerId) {
      return res.status(400).json({
        success: false,
        message: "callerId is required",
      });
    }

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required",
      });
    }

    if (!callerNode) {
      return res.status(400).json({
        success: false,
        message: "callerNode is required",
      });
    }


    // -----------------------------------------------
    // Create emergency
    // -----------------------------------------------

    const session =
      createEmergencySession({
        callerId,
        driverId,
        callerNode,
      });


    // -----------------------------------------------
    // TEMPORARY DIRECT START
    //
    // This existing endpoint still starts the
    // emergency directly.
    //
    // Groq-based flow is handled through:
    // processEmergencyCall()
    // -----------------------------------------------

    startEmergencySession(
      session.emergencyId
    );


    // -----------------------------------------------
    // Get initial simulation
    // -----------------------------------------------

    const latestSession =
      getEmergencySession(
        session.emergencyId
      );


    const telemetry =
      latestSession?.simulationState
        ? buildTelemetry(
            latestSession.simulationState
          )
        : null;


    return res.status(201).json({
      success: true,

      message:
        "Emergency created and simulation started",

      emergency: latestSession,

      telemetry,
    });

  } catch (error) {
    console.error(
      "[EMERGENCY CONTROLLER] Create error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create emergency",

      error:
        error.message,
    });
  }
}


// ==================================================
// PROCESS EMERGENCY CALL WITH GROQ AI
// ==================================================

export const processEmergencyCall = [
  upload.single("audio"),

  async (req, res) => {
    try {

      console.log("\n");
      console.log("==========================================");
      console.log("       RESQWAY EMERGENCY CALL");
      console.log("==========================================");


      // -----------------------------------------------
      // Validate audio
      // -----------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Audio file is required",
        });
      }


      // -----------------------------------------------
      // Get emergency information
      // -----------------------------------------------

      const {
        callerId,
        driverId,
        callerNode,
      } = req.body;


      if (!callerId) {
        return res.status(400).json({
          success: false,
          message: "callerId is required",
        });
      }


      if (!driverId) {
        return res.status(400).json({
          success: false,
          message: "driverId is required",
        });
      }


      if (!callerNode) {
        return res.status(400).json({
          success: false,
          message: "callerNode is required",
        });
      }


      // -----------------------------------------------
      // Log audio information
      // -----------------------------------------------

      console.log("\n[AUDIO]");
      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "MIME:",
        req.file.mimetype
      );

      console.log(
        "Size:",
        req.file.size,
        "bytes"
      );


      // -----------------------------------------------
      // STEP 1
      // Audio → Groq Whisper → Transcript
      // -----------------------------------------------

      console.log(
        "\n[STEP 1] Sending audio to Groq Whisper..."
      );


      const transcription =
        await transcribeAudio(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );


      const transcript =
        transcription.text;


      console.log(
        "\n[TRANSCRIPT]"
      );

      console.log(
        transcript
      );


      // -----------------------------------------------
      // Validate transcript
      // -----------------------------------------------

      if (!transcript || !transcript.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Groq returned an empty transcript",
        });
      }


      // -----------------------------------------------
      // STEP 2
      // Transcript → Groq AI → Emergency Analysis
      // -----------------------------------------------

      console.log(
        "\n[STEP 2] Analyzing emergency with Groq AI..."
      );


      const aiAnalysis =
        await analyzeEmergencyTranscript(
          transcript
        );


      console.log(
        "\n[AI ANALYSIS]"
      );

      console.log(
        JSON.stringify(
          aiAnalysis,
          null,
          2
        )
      );


      // -----------------------------------------------
      // STEP 3
      // Create emergency session
      // -----------------------------------------------

      console.log(
        "\n[STEP 3] Creating emergency session..."
      );


      const session =
        createEmergencySession({
          callerId,
          driverId,
          callerNode,
        });


      // -----------------------------------------------
      // Attach AI information
      //
      // These properties will later also be stored
      // inside emergencyService.
      // -----------------------------------------------

      session.transcript =
        transcript;

      session.aiAnalysis =
        aiAnalysis;


      // -----------------------------------------------
      // STEP 4
      // Check AI decision
      // -----------------------------------------------

      if (!aiAnalysis?.isGenuine) {

        console.log(
          "\n[AI RESULT] NON-EMERGENCY"
        );


        session.status =
          "REJECTED";


        console.log(
          "Emergency simulation will NOT start."
        );

        console.log(
          "==========================================\n"
        );


        return res.status(200).json({
          success: true,

          message:
            "Call analyzed and classified as non-emergency",

          transcription: {
            text: transcript,

            model:
              transcription.model,

            provider:
              transcription.provider,
          },

          analysis:
            aiAnalysis,

          emergency:
            session,
        });
      }


      // -----------------------------------------------
      // STEP 5
      // Genuine emergency
      // Start emergency session
      // -----------------------------------------------

      console.log(
        "\n[AI RESULT] GENUINE EMERGENCY"
      );


      console.log(
        "\n[STEP 4] Starting emergency session..."
      );


      /*
       * IMPORTANT:
       *
       * We are passing the AI analysis into the
       * service.
       *
       * Next we will update emergencyService.js
       * so startEmergencySession() accepts this data.
       */

      const startedSession =
        startEmergencySession(
          session.emergencyId,
          {
            transcript,
            aiAnalysis,
          }
        );


      // -----------------------------------------------
      // Get latest emergency state
      // -----------------------------------------------

      const latestSession =
        getEmergencySession(
          session.emergencyId
        );


      // -----------------------------------------------
      // Build telemetry
      // -----------------------------------------------

      const telemetry =
        latestSession?.simulationState
          ? buildTelemetry(
              latestSession.simulationState
            )
          : null;


      console.log(
        "\n[EMERGENCY STARTED]"
      );

      console.log(
        "Emergency ID:",
        session.emergencyId
      );

      console.log(
        "Simulation started:",
        !!latestSession?.simulationState
      );

      console.log(
        "==========================================\n"
      );


      // -----------------------------------------------
      // Final response
      // -----------------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "Emergency verified and simulation started",

        transcription: {
          text: transcript,

          model:
            transcription.model,

          provider:
            transcription.provider,
        },

        analysis:
          aiAnalysis,

        emergency:
          latestSession || startedSession,

        telemetry,
      });

    } catch (error) {

      console.error(
        "\n[EMERGENCY CONTROLLER] AI processing error:",
        error
      );


      console.log(
        "==========================================\n"
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to process emergency call",

        error:
          error.message,
      });
    }
  },
];


// ==================================================
// GET EMERGENCY
// ==================================================

export function getEmergency(req, res) {
  try {

    const {
      emergencyId,
    } = req.params;


    const session =
      getEmergencySession(
        emergencyId
      );


    if (!session) {
      return res.status(404).json({
        success: false,

        message:
          "Emergency session not found",
      });
    }


    const telemetry =
      session.simulationState
        ? buildTelemetry(
            session.simulationState
          )
        : null;


    return res.status(200).json({
      success: true,

      emergency: session,

      telemetry,
    });

  } catch (error) {

    console.error(
      "[EMERGENCY CONTROLLER] Get error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Failed to get emergency",

      error:
        error.message,
    });
  }
}


// ==================================================
// CANCEL EMERGENCY
// ==================================================

export function cancelEmergency(req, res) {
  try {

    const {
      emergencyId,
    } = req.params;


    const cancelled =
      cancelEmergencySession(
        emergencyId
      );


    if (!cancelled) {
      return res.status(404).json({
        success: false,

        message:
          "Emergency session not found",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        "Emergency cancelled",

      emergencyId,
    });

  } catch (error) {

    console.error(
      "[EMERGENCY CONTROLLER] Cancel error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Failed to cancel emergency",

      error:
        error.message,
    });
  }
}