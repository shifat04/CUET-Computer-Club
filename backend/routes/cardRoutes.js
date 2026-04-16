const express = require('express');
const { createCard, getCards, updateCard, deleteCard } = require('../controllers/cardController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protectAdmin, createCard).get(getCards);
router.route('/:id').put(protectAdmin, updateCard).delete(protectAdmin, deleteCard);

module.exports = router;
