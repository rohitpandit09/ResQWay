const API_URL = "http://localhost:3000";

export async function createEmergencyRequest({
  userId = "USER-001",
  clientNode = "INT-04",
  hospitalNode = "INT-01",
} = {}) {
  const response = await fetch(`${API_URL}/api/emergencies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      clientNode,
      hospitalNode,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create emergency.");
  }

  return data.emergency;
}
