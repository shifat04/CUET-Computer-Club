const express = require('express');
const { createCard, getCards, updateCard, deleteCard } = require('../controllers/cardController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/').post(protectAdmin, authorizeRoles('super_admin', 'editor'), createCard).get(getCards);
router
    .route('/:id')
    .put(protectAdmin, authorizeRoles('super_admin', 'editor'), updateCard)
    .delete(protectAdmin, authorizeRoles('super_admin'), deleteCard);

module.exports = router;
