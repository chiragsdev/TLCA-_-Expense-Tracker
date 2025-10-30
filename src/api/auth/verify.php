<?php
/**
 * Authentication Verification Helper
 * Verifies user token and returns user data
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Verify authentication token
 * 
 * @return array User data
 * @throws Exception if authentication fails
 */
function verifyAuth() {
    // Get token from Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader)) {
        sendError('No authorization token provided', 401);
    }
    
    // Extract token (format: "Bearer <token>")
    $parts = explode(' ', $authHeader);
    if (count($parts) !== 2 || $parts[0] !== 'Bearer') {
        sendError('Invalid authorization format', 401);
    }
    
    $token = $parts[1];
    
    // Verify token in database
    $db = getDBConnection();
    $stmt = $db->prepare("
        SELECT s.user_id, s.expires_at, 
               u.email, u.name, u.role, u.department
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    
    if (!$session) {
        sendError('Invalid or expired token', 401);
    }
    
    return [
        'id' => $session['user_id'],
        'email' => $session['email'],
        'name' => $session['name'],
        'role' => $session['role'],
        'department' => $session['department']
    ];
}

/**
 * Get current user from request
 * Returns user data or sends error if not authenticated
 * 
 * @return array User data
 */
function getCurrentUser() {
    return verifyAuth();
}

/**
 * Require admin role
 * 
 * @param array $user User data from verifyAuth()
 */
function requireAdmin($user) {
    if ($user['role'] !== 'admin') {
        sendError('Administrator access required', 403);
    }
}

/**
 * Check if user has access to department
 * 
 * @param array $user User data from verifyAuth()
 * @param string $department Department name
 * @return bool True if has access
 */
function hasDepartmentAccess($user, $department) {
    // Admins have access to all departments
    if ($user['role'] === 'admin') {
        return true;
    }
    
    // Department managers only have access to their department
    return $user['department'] === $department;
}

// If called directly, verify and return user
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    setCORSHeaders();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }
    
    try {
        $user = verifyAuth();
        sendSuccess(['user' => $user], 'Authentication valid');
    } catch (Exception $e) {
        logError('Verification error', $e);
        sendError($e->getMessage(), 401);
    }
}
