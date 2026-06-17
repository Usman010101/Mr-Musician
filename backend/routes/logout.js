// router.js
import express from 'express';

const router = express.Router();

// Detection endpoint
// Server-side route (Node.js/Express)
router.post('/all', (req, res) => {
  try {
    console.log('Logout request received');
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Match login settings
      sameSite: 'lax',
      path: '/'
    });

    // Optional: Add security headers
    res.header('Clear-Site-Data', '"cookies", "storage"');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
export default router;