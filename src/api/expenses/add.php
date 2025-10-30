<?php
/**
 * Add Expense Endpoint
 * Creates new expense record
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    $data = getRequestBody();
    
    // Validate required fields
    validateRequired($data, ['department', 'description', 'amount', 'date', 'purchased_by']);
    
    $department = $data['department'];
    $description = trim($data['description']);
    $amount = floatval($data['amount']);
    $date = $data['date'];
    $purchasedBy = trim($data['purchased_by']);
    $notes = isset($data['notes']) ? trim($data['notes']) : null;
    $reimbursementStatus = $data['reimbursement_status'] ?? 'Not Required';
    $receiptUrl = $data['receipt_url'] ?? null;
    $receiptFilename = $data['receipt_filename'] ?? null;
    
    // Validate amount
    if ($amount <= 0) {
        sendError('Amount must be greater than zero', 400);
    }
    
    // Validate date format
    $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dateObj || $dateObj->format('Y-m-d') !== $date) {
        sendError('Invalid date format. Use YYYY-MM-DD', 400);
    }
    
    // Check department access
    if (!hasDepartmentAccess($user, $department)) {
        sendError('You do not have access to this department', 403);
    }
    
    // Verify department exists
    $db = getDBConnection();
    $stmt = $db->prepare("SELECT name FROM departments WHERE name = ? AND is_archived = FALSE");
    $stmt->execute([$department]);
    if (!$stmt->fetch()) {
        sendError('Invalid or archived department', 400);
    }
    
    // Validate reimbursement status
    $validStatuses = ['Pending', 'Reimbursed', 'Not Required'];
    if (!in_array($reimbursementStatus, $validStatuses)) {
        sendError('Invalid reimbursement status', 400);
    }
    
    // Generate expense ID
    $expenseId = 'exp_' . uniqid() . '_' . time();
    
    // Insert expense
    $stmt = $db->prepare("
        INSERT INTO expenses (
            id, user_id, department, description, amount, date,
            purchased_by, notes, reimbursement_status, receipt_url, receipt_filename
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $expenseId,
        $user['id'],
        $department,
        $description,
        $amount,
        $date,
        $purchasedBy,
        $notes,
        $reimbursementStatus,
        $receiptUrl,
        $receiptFilename
    ]);
    
    // Get the created expense
    $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
    $stmt->execute([$expenseId]);
    $expense = $stmt->fetch();
    
    sendSuccess(['expense' => $expense], 'Expense added successfully');
    
} catch (PDOException $e) {
    logError('Add expense error', $e);
    sendError('Failed to add expense', 500);
} catch (Exception $e) {
    logError('Add expense error', $e);
    sendError($e->getMessage(), 500);
}
