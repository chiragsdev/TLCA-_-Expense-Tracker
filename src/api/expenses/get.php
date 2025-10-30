<?php
/**
 * Get Expenses Endpoint
 * Retrieves expenses based on user role and filters
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
    $department = $_GET['department'] ?? null;
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Build query based on user role
    $query = "
        SELECT e.*, u.name as user_name
        FROM expenses e
        JOIN users u ON e.user_id = u.id
        WHERE 1=1
    ";
    $params = [];
    
    // Department managers can only see their department
    if ($user['role'] === 'department_manager') {
        $query .= " AND e.department = ?";
        $params[] = $user['department'];
    } else if ($department) {
        // Admins can filter by department
        $query .= " AND e.department = ?";
        $params[] = $department;
    }
    
    // Date filters
    if ($startDate) {
        $query .= " AND e.date >= ?";
        $params[] = $startDate;
    }
    
    if ($endDate) {
        $query .= " AND e.date <= ?";
        $params[] = $endDate;
    }
    
    // Order by date (newest first)
    $query .= " ORDER BY e.date DESC, e.created_at DESC";
    
    // Pagination
    $query .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $expenses = $stmt->fetchAll();
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM expenses e WHERE 1=1";
    $countParams = [];
    
    if ($user['role'] === 'department_manager') {
        $countQuery .= " AND e.department = ?";
        $countParams[] = $user['department'];
    } else if ($department) {
        $countQuery .= " AND e.department = ?";
        $countParams[] = $department;
    }
    
    if ($startDate) {
        $countQuery .= " AND e.date >= ?";
        $countParams[] = $startDate;
    }
    
    if ($endDate) {
        $countQuery .= " AND e.date <= ?";
        $countParams[] = $endDate;
    }
    
    $stmt = $db->prepare($countQuery);
    $stmt->execute($countParams);
    $total = $stmt->fetch()['total'];
    
    sendSuccess([
        'expenses' => $expenses,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset
    ]);
    
} catch (Exception $e) {
    logError('Get expenses error', $e);
    sendError('Failed to retrieve expenses', 500);
}
