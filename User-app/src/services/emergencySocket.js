export const connectEmergencySocket = (
  emergencyId,
  onMessage
) => {

  const socket = new WebSocket(
    `${import.meta.env.VITE_WS_URL}/emergency/${emergencyId}`
  );


  socket.onopen = () => {

    console.log(
      "Emergency WebSocket connected"
    );

  };


  socket.onmessage = (event) => {

    try {

      const data = JSON.parse(event.data);

      onMessage(data);

    } catch (error) {

      console.error(
        "Invalid WebSocket message:",
        error
      );

    }

  };


  socket.onerror = (error) => {

    console.error(
      "Emergency WebSocket error:",
      error
    );

  };


  socket.onclose = () => {

    console.log(
      "Emergency WebSocket disconnected"
    );

  };


  return socket;
};