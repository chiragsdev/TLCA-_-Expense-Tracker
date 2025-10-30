<?php
/**
 * Add Department Endpoint
 * Creates new department (admin only)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    requireAdmin($user);
    
    $data = getRequestBody();
    validateRequired($data, ['name']);
    
    $name = trim($data['name']);
    
    // Validate name
    if (empty($name)) {
        sendError('Department name cannot be empty', 400);
    }
    
    if (strlen($name) > 100) {
        sendError('Department name too long (max 100 characters)', 400);
    }
    
    // Check if department already exists
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id, is_archived FROM departments WHERE name = ?");
    $stmt->execute([$name]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        if ($existing['is_archived']) {
            // Unarchive existing department
            $stmt = $db->prepare("UPDATE departments SET is_archived = FALSE WHERE id = ?");
            $stmt->execute([$existing['id']]);
            
            sendSuccess(['department' => ['id' => $existing['id'], 'name' => $name, 'is_archived' => false]], 'Department unarchived successfully');
        } else {
            sendError('Department already exists', 409);
        }
    } else {
        // Create new department
        $stmt = $db->prepare("INSERT INTO departments (name, is_archived) VALUES (?, FALSE)");
        $stmt->execute([$name]);
        
        $departmentId = $db->lastInsertId();
        
        sendSuccess([
            'department' => [
                'id' => $departmentId,
                'name' => $name,
                'is_archived' => false
            ]
        ], 'Department created successfully');
    }
    
} catch (PDOException $e) {
    logError('Add department error', $e);
    sendError('Failed to add department', 500);
} catch (Exception $e) {
    logError('Add department error', $e);
    sendError($e->getMessage(), 500);
}
