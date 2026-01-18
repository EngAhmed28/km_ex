import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

// Generate JWT Token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with default role 'customer'
    console.log('🔄 Attempting to insert user:', { name, email, role: 'customer' });
    console.log('🔄 Database:', process.env.DB_NAME || 'king_of_muscles');
    console.log('🔄 Connection pool config:', {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'king_of_muscles'
    });
    
    // First, verify we can connect to the right database
    const [dbCheck] = await pool.execute('SELECT DATABASE() as current_db');
    console.log('🔄 Current database:', dbCheck[0]?.current_db);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'customer']
    );
    
    console.log('🔄 Insert result:', {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      serverStatus: result.serverStatus,
      warningCount: result.warningCount
    });

    const userId = result.insertId;
    
    console.log('✅ User registered successfully:', { 
      userId, 
      email, 
      name, 
      insertId: result.insertId,
      affectedRows: result.affectedRows 
    });
    
    // Verify user was inserted
    const [verifyUsers] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (verifyUsers.length === 0) {
      console.error('❌ ERROR: User was not found after insertion!');
      throw new Error('فشل إنشاء المستخدم - لم يتم العثور عليه بعد الإدراج');
    }
    
    console.log('✅ Verified user exists in database:', verifyUsers[0]);

    // Generate token
    const token = generateToken(userId, email);

    // Get user data (without password)
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user: users[0],
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الحساب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    const user = users[0];

    // Check if user is active (if column exists)
    if (user.is_active !== undefined && (user.is_active === false || user.is_active === 0)) {
      return res.status(403).json({
        success: false,
        message: 'حسابك معطل، يرجى التواصل مع الإدارة'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المستخدم'
    });
  }
};
