const dgram = require("dgram");
const express = require("express");
const cors = require("cors");

const app = express();
const udpPort = 10124; // Port to listen for UDP packets
let latestTime = null; // Store the latest time data

// Array to hold SSE clients (we'll push updates to all connected clients)
let sseClients = [];

// Regular expression to extract the time in the format (e.g., 1:08.3 or 1:09.5)
const timeRegex = /(?:\d+:)?\d{1,2}\.\d{1,2}/;

// Create UDP socket
const udpServer = dgram.createSocket("udp4");

// Enable CORS for all routes
app.use(cors());

// Listen for incoming UDP packets
udpServer.on("message", (msg, rinfo) => {
  try {
    const message = msg.toString("ascii"); // Convert the UDP bytes to an ASCII string
    const match = message.match(timeRegex); // Use regex to find the timing data

    if (match) {
      latestTime = match[0]; // Extract the timing data
      console.log(
        `Received time: ${latestTime} from ${rinfo.address}:${rinfo.port}`
      );

      // Broadcast the latest time to all SSE clients
      sseClients.forEach((client) => {
        client.res.write(`data: ${JSON.stringify({ latestTime })}\n\n`);
      });
    } else {
      console.log("No valid time data found in the packet");
    }
  } catch (error) {
    console.error("Error processing UDP packet:", error);
  }
});

// Bind to the specified UDP port
udpServer.bind(udpPort, () => {
  console.log(`Listening for UDP packets on port ${udpPort}`);
});

// Setup Express API endpoint to retrieve the latest time
app.get("/latest-time", (req, res) => {
  res.json({ latestTime });
});

// Setup SSE endpoint for real-time updates
app.get("/events", (req, res) => {
  // Set the necessary headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Send the headers immediately

  // Add the client to the list of connected SSE clients
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  console.log(`Client connected: ${clientId}`);

  // Send the current latest time immediately upon connection (if available)
  if (latestTime) {
    res.write(`data: ${JSON.stringify({ latestTime })}\n\n`);
  }

  // Handle client disconnect
  req.on("close", () => {
    console.log(`Client disconnected: ${clientId}`);
    sseClients = sseClients.filter((client) => client.id !== clientId);
  });
});

// Start the Express server
const httpPort = 3000;
app.listen(httpPort, () => {
  console.log(`Express server is running on port ${httpPort}`);
});
