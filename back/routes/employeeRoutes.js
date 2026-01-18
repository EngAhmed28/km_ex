import express from 'express';
import { getEmployeePermissions } from '../controllers/employeeController.js';
import { requireRole } from '../middleware/roleCheck.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All employee routes require authentication and employee role
router.use(authenticateToken);
router.use(requireRole('employee'));

// Get own permissions
router.get('/permissions', getEmployeePermissions);

export default router;
