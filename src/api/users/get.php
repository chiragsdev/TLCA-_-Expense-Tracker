<?php
/**
 * Get Users Endpoint
 * Retrieves all users (admin only)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    requireAdmin($user);
    
    $db = getDBConnection();
    
    // Get all users (excluding passwords)
    $stmt = $db->query("
        SELECT id, email, name, role, department, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
    ");
    $users = $stmt->fetchAll();
    
    sendSuccess(['users' => $users]);
    
} catch (Exception $e) {
    logError('Get users error', $e);
    sendError('Failed to retrieve users', 500);
}
