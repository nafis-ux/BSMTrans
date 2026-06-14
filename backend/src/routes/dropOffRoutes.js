const express = require('express');
const router = express.Router();
const dropOffController = require('../controllers/dropOffController');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');

router.get('/', dropOffController.getAllDropOff);
router.get('/:id', dropOffController.getDropOffById);
router.post('/', verifyToken, verifyAdmin, dropOffController.createDropOff);
router.put('/:id', verifyToken, verifyAdmin, dropOffController.updateDropOff);
router.delete('/:id', verifyToken, verifyAdmin, dropOffController.deleteDropOff);

module.exports = router;
