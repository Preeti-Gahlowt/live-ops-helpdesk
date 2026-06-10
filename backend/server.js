const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// In-memory lock storage
const lockedTickets = new Map();

// Listen for socket connections
io.on("connection", (socket) => {
 console.log("Connected:", socket.id);

 socket.on("join_dashboard", () => {

  socket.emit(
    "lock_state",
    Object.fromEntries(lockedTickets)
  );

});
  socket.on("lock_ticket", (ticketId) => {

  if (lockedTickets.has(ticketId)) {

    socket.emit("lock_failed", {
      ticketId,
      message: "Ticket already locked"
    });

    return;
  }

  lockedTickets.set(ticketId, socket.id);

  io.emit("ticket_locked", {
    ticketId,
    lockedBy: socket.id
  });

});

// Listen for unlock events
socket.on("unlock_ticket", (ticketId) => {

  const owner = lockedTickets.get(ticketId);

  if (owner !== socket.id) {
    return;
  }

  lockedTickets.delete(ticketId);

  io.emit("ticket_unlocked", {
    ticketId
  });

});

// Handle disconnects
  socket.on("disconnect", () => {

  console.log(`Disconnected: ${socket.id}`);

  for (const [ticketId, owner] of lockedTickets.entries()) {

    if (owner === socket.id) {

      lockedTickets.delete(ticketId);

      io.emit("ticket_unlocked", {
        ticketId
      });

    }
  }

});
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});