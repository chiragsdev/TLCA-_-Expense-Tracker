<?php
/**
 * Add Income Endpoint
 * Creates new income record
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
    validateRequired($data, ['department', 'description', 'amount', 'date', 'contributed_by']);
    
    $department = $data['department'];
    $description = trim($data['description']);
    $amount = floatval($data['amount']);
    $date = $data['date'];
    $contributedBy = trim($data['contributed_by']);
    $notes = isset($data['notes']) ? trim($data['notes']) : null;
    
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
    
    // Generate income ID
    $incomeId = 'inc_' . uniqid() . '_' . time();
    
    // Insert income
    $stmt = $db->prepare("
        INSERT INTO income (
            id, user_id, department, description, amount, date,
            contributed_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $incomeId,
        $user['id'],
        $department,
        $description,
        $amount,
        $date,
        $contributedBy,
        $notes
    ]);
    
    // Get the created income record
    $stmt = $db->prepare("SELECT * FROM income WHERE id = ?");
    $stmt->execute([$incomeId]);
    $income = $stmt->fetch();
    
    sendSuccess(['income' => $income], 'Income added successfully');
    
} catch (PDOException $e) {
    logError('Add income error', $e);
    sendError('Failed to add income', 500);
} catch (Exception $e) {
    logError('Add income error', $e);
    sendError($e->getMessage(), 500);
}
