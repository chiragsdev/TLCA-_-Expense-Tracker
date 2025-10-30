<?php
/**
 * Login Endpoint
 * Authenticates user and creates session
 */

require_once __DIR__ . '/../config/database.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $data = getRequestBody();
    validateRequired($data, ['email', 'password']);
    
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        sendError('Invalid email format', 400);
    }
    
    $password = $data['password'];
    
    // Get user from database
    $db = getDBConnection();
    $stmt = $db->prepare("
        SELECT id, email, password_hash, name, role, department 
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Invalid email or password', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        sendError('Invalid email or password', 401);
    }
    
    // Generate session token
    $sessionId = bin2hex(random_bytes(32));
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_DURATION);
    
    // Store session
    $stmt = $db->prepare("
        INSERT INTO sessions (id, user_id, token, expires_at)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$sessionId, $user['id'], $token, $expiresAt]);
    
    // Clean up old sessions for this user
    $stmt = $db->prepare("
        DELETE FROM sessions 
        WHERE user_id = ? AND expires_at < NOW()
    ");
    $stmt->execute([$user['id']]);
    
    // Return user data and token
    sendSuccess([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'department' => $user['department']
        ],
        'token' => $token,
        'expiresAt' => $expiresAt
    ], 'Login successful');
    
} catch (PDOException $e) {
    logError('Login error', $e);
    sendError('Login failed. Please try again.', 500);
} catch (Exception $e) {
    logError('Login error', $e);
    sendError($e->getMessage(), 500);
}
