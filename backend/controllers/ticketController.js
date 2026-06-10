const tickets = require("../data/tickets");

const getAllTickets = (req, res) => {
  res.status(200).json(tickets);
};

module.exports = {
  getAllTickets
};