import express from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Test database connection and users table
router.get('/db-test', async (req, res) => {
  try {
    // Test connection
    const [connection] = await pool.execute('SELECT 1 as test');
    
    // Get users table structure
    const [tableInfo] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME || 'king_of_muscles']);
    
    // Get all users
    const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
    
    // Get users count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connection: 'OK',
        tableStructure: tableInfo,
        usersCount: countResult[0].total,
        users: users,
        database: process.env.DB_NAME || 'king_of_muscles'
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
    });
  }
});

// Test insert (actually inserts a test user)
router.post('/test-insert', async (req, res) => {
  try {
    const testName = 'Test User';
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'Test123456';
    
    console.log('🧪 Testing user insertion...');
    console.log('🧪 Database:', process.env.DB_NAME || 'king_of_muscles');
    
    // Check current database
    const [dbCheck] = await pool.execute('SELECT DATABASE() as current_db');
    console.log('🧪 Current database:', dbCheck[0]?.current_db);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('🧪 Password hashed');
    
    // Insert user
    console.log('🧪 Inserting user:', { name: testName, email: testEmail, role: 'customer' });
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [testName, testEmail, hashedPassword, 'customer']
    );
    
    console.log('🧪 Insert result:', {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    });
    
    // Verify user was inserted
    const [verifyUsers] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );
    
    console.log('🧪 Verification:', verifyUsers.length > 0 ? 'User found!' : 'User NOT found!');
    
    // Get all users
    const [allUsers] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
    
    res.json({
      success: true,
      message: 'Test insert completed',
      data: {
        insertId: result.insertId,
        affectedRows: result.affectedRows,
        userFound: verifyUsers.length > 0,
        insertedUser: verifyUsers[0] || null,
        allUsers: allUsers,
        totalUsers: allUsers.length
      }
    });
  } catch (error) {
    console.error('🧪 Test insert error:', error);
    res.status(500).json({
      success: false,
      message: 'Test insert failed',
      error: {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
    });
  }
});

// Test insert (without actually inserting)
router.get('/db-test-insert', async (req, res) => {
  try {
    // Test if we can prepare the insert statement
    const testName = 'Test User';
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'test123';
    
    // Check table structure
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'king_of_muscles']);
    
    res.json({
      success: true,
      message: 'Insert test prepared',
      data: {
        testData: {
          name: testName,
          email: testEmail,
          password: '***hidden***',
          role: 'customer'
        },
        tableColumns: columns,
        note: 'This is just a test - no actual insert was performed'
      }
    });
  } catch (error) {
    console.error('Insert test error:', error);
    res.status(500).json({
      success: false,
      message: 'Insert test failed',
      error: error.message
    });
  }
});

export default router;
