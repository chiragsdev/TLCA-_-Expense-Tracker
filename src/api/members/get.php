<?php
/**
 * Get Church Members Endpoint
 * Retrieves all church members for autocomplete
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
    
    // Get search query if provided
    $search = $_GET['search'] ?? null;
    
    $query = "SELECT id, name FROM church_members WHERE 1=1";
    $params = [];
    
    if ($search) {
        $query .= " AND name LIKE ?";
        $params[] = '%' . $search . '%';
    }
    
    $query .= " ORDER BY name ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $members = $stmt->fetchAll();
    
    sendSuccess(['members' => $members]);
    
} catch (Exception $e) {
    logError('Get members error', $e);
    sendError('Failed to retrieve church members', 500);
}
