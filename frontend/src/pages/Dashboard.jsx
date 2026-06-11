import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
function Dashboard() {
  const [tickets] = useState([]);
  const [locked, setLocked] = useState({});
  const [mySocketId, setMySocketId] = useState("");
 useEffect(() => {

 fetch(`${import.meta.env.VITE_API_URL}/api/tickets`)
  .then((res) => res.text())
  .then((data) => {
    console.log(data);
  });
  

  socket.emit("join_dashboard");

  socket.on("connect", () => {
  setMySocketId(socket.id);
});
  const handleTicketLocked = (data) => {

    setLocked((prev) => ({
  ...prev,
  [data.ticketId]: data.lockedBy
}));

  };
  socket.on("lock_state", (data) => {
  setLocked(data);
});
  socket.on("ticket_locked", handleTicketLocked);
  socket.on("ticket_unlocked", (data) => {

  setLocked((prev) => {

    const updated = { ...prev };

    delete updated[data.ticketId];

    return updated;
  });

});

  return () => {
    socket.off("ticket_locked", handleTicketLocked);
  };

  

}, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Live Ops Helpdesk</h1>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            border: "1px solid black",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{ticket.title}</h3>

          <p>ID: {ticket.id}</p>

          <p>{ticket.description}</p>

          <p>Status: {ticket.status}</p>

              {locked[ticket.id] === mySocketId ? (
  <button
    onClick={() =>
      socket.emit("unlock_ticket", ticket.id)
    }
  >
    Close Ticket
  </button>
) : (
  <button
    disabled={!!locked[ticket.id]}
    onClick={() =>
      socket.emit("lock_ticket", ticket.id)
    }
  >
    Open Ticket
  </button>
)}
        </div>
      ))}
    </div>
  );
}

export default Dashboard;