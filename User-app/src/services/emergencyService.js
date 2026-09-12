const API_URL = import.meta.env.VITE_API_URL;

export const getEmergencySession = async (
  emergencyId
) => {

  const response = await fetch(
    `${API_URL}/api/emergency/${emergencyId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch emergency session"
    );
  }

  return response.json();
};