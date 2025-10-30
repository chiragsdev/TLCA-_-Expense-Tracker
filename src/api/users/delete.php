<?php
/**
 * Delete User Endpoint
 * Deletes user account (admin only)
 * Note: Associated expenses/income are preserved but user_id is maintained for audit
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    requireAdmin($user);
    
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        sendError('User ID is required', 400);
    }
    
    // Prevent admin from deleting themselves
    if ($userId === $user['id']) {
        sendError('Cannot delete your own account', 400);
    }
    
    // Check if user exists
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        sendError('User not found', 404);
    }
    
    // Delete user (expenses and income will be preserved due to ON DELETE CASCADE on sessions only)
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    sendSuccess(null, 'User deleted successfully');
    
} catch (PDOException $e) {
    logError('Delete user error', $e);
    sendError('Failed to delete user', 500);
} catch (Exception $e) {
    logError('Delete user error', $e);
    sendError($e->getMessage(), 500);
}
