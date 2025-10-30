<?php
/**
 * Signup Endpoint
 * Creates new user account (admin only for department managers)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $data = getRequestBody();
    
    // Check if this is first user (admin setup) or admin creating new user
    $db = getDBConnection();
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    $isFirstUser = $result['count'] == 0;
    
    if (!$isFirstUser) {
        // Verify admin access
        $currentUser = verifyAuth();
        if ($currentUser['role'] !== 'admin') {
            sendError('Only administrators can create new users', 403);
        }
    }
    
    // Validate required fields
    validateRequired($data, ['email', 'password', 'name']);
    
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        sendError('Invalid email format', 400);
    }
    
    $password = $data['password'];
    if (strlen($password) < 8) {
        sendError('Password must be at least 8 characters long', 400);
    }
    
    $name = trim($data['name']);
    $role = $isFirstUser ? 'admin' : ($data['role'] ?? 'department_manager');
    $department = $data['department'] ?? null;
    
    // Validate role
    if (!in_array($role, ['admin', 'department_manager'])) {
        sendError('Invalid role', 400);
    }
    
    // Department managers must have a department
    if ($role === 'department_manager' && empty($department)) {
        sendError('Department is required for department managers', 400);
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Email already registered', 409);
    }
    
    // Verify department exists if provided
    if ($department) {
        $stmt = $db->prepare("SELECT name FROM departments WHERE name = ? AND is_archived = FALSE");
        $stmt->execute([$department]);
        if (!$stmt->fetch()) {
            sendError('Invalid or archived department', 400);
        }
    }
    
    // Generate user ID
    $userId = uniqid('user_', true);
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Create user
    $stmt = $db->prepare("
        INSERT INTO users (id, email, password_hash, name, role, department)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $email, $passwordHash, $name, $role, $department]);
    
    // Return user data (without password)
    sendSuccess([
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'role' => $role,
            'department' => $department
        ]
    ], $isFirstUser ? 'Admin account created successfully' : 'User created successfully');
    
} catch (PDOException $e) {
    logError('Signup error', $e);
    sendError('Signup failed. Please try again.', 500);
} catch (Exception $e) {
    logError('Signup error', $e);
    sendError($e->getMessage(), 500);
}
