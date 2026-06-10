const express = require("express");

const {
  getAllTickets
} = require("../controllers/ticketController");

const router = express.Router();

router.get("/", getAllTickets);

module.exports = router;