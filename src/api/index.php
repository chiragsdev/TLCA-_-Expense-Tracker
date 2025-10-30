<?php
/**
 * API Index / Health Check
 * True Light Christian Assembly - Expense Tracker
 */

require_once __DIR__ . '/config/database.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    // Test database connection
    $db = getDBConnection();
    
    // Get database info
    $stmt = $db->query("SELECT VERSION() as version");
    $dbInfo = $stmt->fetch();
    
    // Get table count
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll();
    
    sendSuccess([
        'status' => 'online',
        'database' => 'connected',
        'mysql_version' => $dbInfo['version'],
        'tables' => count($tables),
        'timestamp' => date('Y-m-d H:i:s')
    ], 'API is operational');
    
} catch (Exception $e) {
    logError('API health check failed', $e);
    sendError('API health check failed', 500);
}
