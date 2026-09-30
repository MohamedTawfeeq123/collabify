const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  searchUsers,
  lookupUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validatePasswordChange } = require('../middleware/validationMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);
router.get('/search', protect, searchUsers);
router.get('/lookup', protect, lookupUser);

module.exports = router;
