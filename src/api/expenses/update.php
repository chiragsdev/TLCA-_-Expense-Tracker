<?php
/**
 * Update Expense Endpoint
 * Updates existing expense record
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    $data = getRequestBody();
    
    // Validate required fields
    validateRequired($data, ['id']);
    
    $expenseId = $data['id'];
    
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
    
    // Build update query dynamically based on provided fields
    $updates = [];
    $params = [];
    
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = trim($data['description']);
    }
    
    if (isset($data['amount'])) {
        $amount = floatval($data['amount']);
        if ($amount <= 0) {
            sendError('Amount must be greater than zero', 400);
        }
        $updates[] = "amount = ?";
        $params[] = $amount;
    }
    
    if (isset($data['date'])) {
        $dateObj = DateTime::createFromFormat('Y-m-d', $data['date']);
        if (!$dateObj || $dateObj->format('Y-m-d') !== $data['date']) {
            sendError('Invalid date format. Use YYYY-MM-DD', 400);
        }
        $updates[] = "date = ?";
        $params[] = $data['date'];
    }
    
    if (isset($data['purchased_by'])) {
        $updates[] = "purchased_by = ?";
        $params[] = trim($data['purchased_by']);
    }
    
    if (isset($data['notes'])) {
        $updates[] = "notes = ?";
        $params[] = trim($data['notes']);
    }
    
    if (isset($data['reimbursement_status'])) {
        $validStatuses = ['Pending', 'Reimbursed', 'Not Required'];
        if (!in_array($data['reimbursement_status'], $validStatuses)) {
            sendError('Invalid reimbursement status', 400);
        }
        $updates[] = "reimbursement_status = ?";
        $params[] = $data['reimbursement_status'];
    }
    
    if (isset($data['receipt_url'])) {
        $updates[] = "receipt_url = ?";
        $params[] = $data['receipt_url'];
    }
    
    if (isset($data['receipt_filename'])) {
        $updates[] = "receipt_filename = ?";
        $params[] = $data['receipt_filename'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update', 400);
    }
    
    // Add expense ID to params
    $params[] = $expenseId;
    
    // Update expense
    $query = "UPDATE expenses SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    // Get updated expense
    $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
    $stmt->execute([$expenseId]);
    $updatedExpense = $stmt->fetch();
    
    sendSuccess(['expense' => $updatedExpense], 'Expense updated successfully');
    
} catch (PDOException $e) {
    logError('Update expense error', $e);
    sendError('Failed to update expense', 500);
} catch (Exception $e) {
    logError('Update expense error', $e);
    sendError($e->getMessage(), 500);
}
