const express = require('express');
const router = express.Router();
const { getAllRute, createRute, updateRute, deleteRute, getOccupiedSeats, getDetailRute } = require('../controllers/travelController');

router.get('/', getAllRute);
router.post('/', createRute);
router.put('/:id', updateRute);
router.delete('/:id', deleteRute);
router.get('/:id/occupied-seats', getOccupiedSeats);
router.get('/:id', getDetailRute)

module.exports = router;