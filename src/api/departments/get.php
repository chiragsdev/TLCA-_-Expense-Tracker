<?php
/**
 * Get Departments Endpoint
 * Retrieves all departments (active by default)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    $db = getDBConnection();
    
    // Get query parameters
    $includeArchived = isset($_GET['include_archived']) && $_GET['include_archived'] === 'true';
    
    // Build query
    $query = "SELECT * FROM departments WHERE 1=1";
    $params = [];
    
    if (!$includeArchived) {
        $query .= " AND is_archived = FALSE";
    }
    
    $query .= " ORDER BY name ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $departments = $stmt->fetchAll();
    
    // If user is a department manager, only return their department
    if ($user['role'] === 'department_manager') {
        $departments = array_filter($departments, function($dept) use ($user) {
            return $dept['name'] === $user['department'];
        });
        $departments = array_values($departments); // Re-index array
    }
    
    sendSuccess(['departments' => $departments]);
    
} catch (Exception $e) {
    logError('Get departments error', $e);
    sendError('Failed to retrieve departments', 500);
}
