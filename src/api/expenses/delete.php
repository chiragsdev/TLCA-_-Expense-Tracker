<?php
/**
 * Delete Expense Endpoint
 * Deletes expense record
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    
    // Get expense ID from query parameter
    $expenseId = $_GET['id'] ?? null;
    
    if (!$expenseId) {
        sendError('Expense ID is required', 400);
    }
    
    // Get existing expense
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
    $stmt->execute([$expenseId]);
    $expense = $stmt->fetch();
    
    if (!$expense) {
        sendError('Expense not found', 404);
    }
    
    // Check access
    if (!hasDepartmentAccess($user, $expense['department'])) {
        sendError('You do not have access to this expense', 403);
    }
    
    // Delete receipt file if exists
    if ($expense['receipt_filename']) {
        $receiptPath = UPLOAD_DIR . $expense['receipt_filename'];
        if (file_exists($receiptPath)) {
            @unlink($receiptPath);
        }
    }
    
    // Delete expense
    $stmt = $db->prepare("DELETE FROM expenses WHERE id = ?");
    $stmt->execute([$expenseId]);
    
    sendSuccess(null, 'Expense deleted successfully');
    
} catch (PDOException $e) {
    logError('Delete expense error', $e);
    sendError('Failed to delete expense', 500);
} catch (Exception $e) {
    logError('Delete expense error', $e);
    sendError($e->getMessage(), 500);
}
