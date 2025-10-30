<?php
/**
 * Logout Endpoint
 * Invalidates user session
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    // Get token from Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!empty($authHeader)) {
        $parts = explode(' ', $authHeader);
        if (count($parts) === 2 && $parts[0] === 'Bearer') {
            $token = $parts[1];
            
            // Delete session
            $db = getDBConnection();
            $stmt = $db->prepare("DELETE FROM sessions WHERE token = ?");
            $stmt->execute([$token]);
        }
    }
    
    sendSuccess(null, 'Logout successful');
    
} catch (Exception $e) {
    logError('Logout error', $e);
    sendError('Logout failed', 500);
}
