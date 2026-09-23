import emergencyService from "./emergencyService.js";


// ==================================================
// CREATE EMERGENCY
// ==================================================

export function createEmergency(
    req,
    res
) {

    try {

        const {
            userId = null,
            clientNode = "INT-04",
            hospitalNode = "INT-01"
        } = req.body;


        const emergency =
            emergencyService.createEmergency({

                userId,

                clientNode,

                hospitalNode

            });


        return res
            .status(201)
            .json({

                success:
                    true,

                message:
                    "Emergency created successfully.",

                emergency

            });

    }

    catch (error) {

        console.error(
            "❌ Create emergency failed:",
            error
        );


        return res
            .status(500)
            .json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to create emergency."

            });

    }

}


// ==================================================
// GET EMERGENCY
// ==================================================

export function getEmergency(
    req,
    res
) {

    try {

        const {
            emergencyId
        } = req.params;


        const emergency =
            emergencyService.getEmergency(
                emergencyId
            );


        if (!emergency) {

            return res
                .status(404)
                .json({

                    success:
                        false,

                    message:
                        "Emergency not found."

                });

        }


        return res.json({

            success:
                true,

            emergency

        });

    }

    catch (error) {

        console.error(
            "❌ Get emergency failed:",
            error
        );


        return res
            .status(500)
            .json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to get emergency."

            });

    }

}


// ==================================================
// GET ALL EMERGENCIES
// ==================================================

export function getAllEmergencies(
    req,
    res
) {

    try {

        const emergencies =
            emergencyService
                .getAllEmergencies();


        return res.json({

            success:
                true,

            emergencies

        });

    }

    catch (error) {

        console.error(
            "❌ Get emergencies failed:",
            error
        );


        return res
            .status(500)
            .json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to get emergencies."

            });

    }

}