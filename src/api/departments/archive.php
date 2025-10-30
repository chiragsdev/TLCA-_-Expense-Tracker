<?php
/**
 * Archive/Unarchive Department Endpoint
 * Archives or unarchives a department (admin only)
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
    validateRequired($data, ['name', 'is_archived']);
    
    $name = trim($data['name']);
    $isArchived = (bool)$data['is_archived'];
    
    // Check if department exists
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id FROM departments WHERE name = ?");
    $stmt->execute([$name]);
    $department = $stmt->fetch();
    
    if (!$department) {
        sendError('Department not found', 404);
    }
    
    // Update archive status
    $stmt = $db->prepare("UPDATE departments SET is_archived = ? WHERE name = ?");
    $stmt->execute([$isArchived ? 1 : 0, $name]);
    
    $action = $isArchived ? 'archived' : 'unarchived';
    sendSuccess([
        'department' => [
            'id' => $department['id'],
            'name' => $name,
            'is_archived' => $isArchived
        ]
    ], "Department $action successfully");
    
} catch (PDOException $e) {
    logError('Archive department error', $e);
    sendError('Failed to archive/unarchive department', 500);
} catch (Exception $e) {
    logError('Archive department error', $e);
    sendError($e->getMessage(), 500);
}
