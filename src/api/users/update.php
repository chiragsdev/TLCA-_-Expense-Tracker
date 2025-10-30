<?php
/**
 * Update User Endpoint
 * Updates user information and/or password (admin only)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    requireAdmin($user);
    
    $data = getRequestBody();
    validateRequired($data, ['user_id']);
    
    $userId = $data['user_id'];
    
    // Get existing user
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $targetUser = $stmt->fetch();
    
    if (!$targetUser) {
        sendError('User not found', 404);
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $params[] = trim($data['name']);
    }
    
    if (isset($data['email'])) {
        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) {
            sendError('Invalid email format', 400);
        }
        
        // Check if email is already taken by another user
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            sendError('Email already in use', 409);
        }
        
        $updates[] = "email = ?";
        $params[] = $email;
    }
    
    if (isset($data['department'])) {
        $department = $data['department'];
        
        // Verify department exists if not null
        if ($department !== null) {
            $stmt = $db->prepare("SELECT name FROM departments WHERE name = ? AND is_archived = FALSE");
            $stmt->execute([$department]);
            if (!$stmt->fetch()) {
                sendError('Invalid or archived department', 400);
            }
        }
        
        $updates[] = "department = ?";
        $params[] = $department;
    }
    
    if (isset($data['password'])) {
        $password = $data['password'];
        
        if (strlen($password) < 8) {
            sendError('Password must be at least 8 characters long', 400);
        }
        
        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $updates[] = "password_hash = ?";
        $params[] = $passwordHash;
    }
    
    if (empty($updates)) {
        sendError('No fields to update', 400);
    }
    
    // Add user ID to params
    $params[] = $userId;
    
    // Update user
    $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    // Get updated user
    $stmt = $db->prepare("
        SELECT id, email, name, role, department, created_at, updated_at
        FROM users WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $updatedUser = $stmt->fetch();
    
    sendSuccess(['user' => $updatedUser], 'User updated successfully');
    
} catch (PDOException $e) {
    logError('Update user error', $e);
    sendError('Failed to update user', 500);
} catch (Exception $e) {
    logError('Update user error', $e);
    sendError($e->getMessage(), 500);
}
