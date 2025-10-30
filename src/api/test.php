<?php
/**
 * API Test Page - Test Database Connection and Login
 * DELETE THIS FILE AFTER TESTING!
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>API Test - TLCA Expense Tracker</title>
    <style>
        body { font-family: monospace; padding: 20px; max-width: 800px; margin: 0 auto; }
        .test { margin: 20px 0; padding: 15px; border: 2px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #28a745; }
        .error { background: #f8d7da; border-color: #dc3545; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 0; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        .info { background: #d1ecf1; border-color: #0c5460; color: #0c5460; }
    </style>
</head>
<body>
    <h1>🔧 True Light Christian Assembly - API Test</h1>
    <p><strong>⚠️ DELETE THIS FILE AFTER TESTING!</strong></p>
    
    <?php
    // Test 1: Database Connection
    echo '<div class="test">';
    echo '<h2>Test 1: Database Connection</h2>';
    try {
        $db = getDBConnection();
        echo '<div class="success">';
        echo '<p>✅ Database connection successful!</p>';
        echo '<p>Host: ' . DB_HOST . '</p>';
        echo '<p>Database: ' . DB_NAME . '</p>';
        echo '</div>';
    } catch (Exception $e) {
        echo '<div class="error">';
        echo '<p>❌ Database connection failed!</p>';
        echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
        echo '</div>';
    }
    echo '</div>';
    
    // Test 2: Tables Check
    echo '<div class="test">';
    echo '<h2>Test 2: Database Tables</h2>';
    try {
        $db = getDBConnection();
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        echo '<div class="success">';
        echo '<p>✅ Found ' . count($tables) . ' tables:</p>';
        echo '<ul>';
        foreach ($tables as $table) {
            echo '<li>' . htmlspecialchars($table) . '</li>';
        }
        echo '</ul>';
        echo '</div>';
    } catch (Exception $e) {
        echo '<div class="error">';
        echo '<p>❌ Failed to get tables!</p>';
        echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
        echo '</div>';
    }
    echo '</div>';
    
    // Test 3: User Count
    echo '<div class="test">';
    echo '<h2>Test 3: Users in Database</h2>';
    try {
        $db = getDBConnection();
        $stmt = $db->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        $userCount = $result['count'];
        
        echo '<div class="' . ($userCount > 0 ? 'success' : 'info') . '">';
        echo '<p>Found ' . $userCount . ' user(s) in database</p>';
        
        if ($userCount > 0) {
            $stmt = $db->query("SELECT id, email, name, role, department FROM users LIMIT 5");
            $users = $stmt->fetchAll();
            
            echo '<p>Users:</p>';
            echo '<table border="1" cellpadding="5" style="border-collapse: collapse;">';
            echo '<tr><th>Email</th><th>Name</th><th>Role</th><th>Department</th></tr>';
            foreach ($users as $user) {
                echo '<tr>';
                echo '<td>' . htmlspecialchars($user['email']) . '</td>';
                echo '<td>' . htmlspecialchars($user['name']) . '</td>';
                echo '<td>' . htmlspecialchars($user['role']) . '</td>';
                echo '<td>' . htmlspecialchars($user['department'] ?? 'N/A') . '</td>';
                echo '</tr>';
            }
            echo '</table>';
        } else {
            echo '<p>No users found. Create your first admin user!</p>';
        }
        echo '</div>';
    } catch (Exception $e) {
        echo '<div class="error">';
        echo '<p>❌ Failed to query users!</p>';
        echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
        echo '</div>';
    }
    echo '</div>';
    
    // Test 4: Test Login Endpoint
    echo '<div class="test">';
    echo '<h2>Test 4: Login Endpoint Response Format</h2>';
    echo '<div class="info">';
    echo '<p>This test simulates what the login endpoint returns.</p>';
    echo '<p>Try logging in with one of the users listed above.</p>';
    echo '<p><strong>Expected response format:</strong></p>';
    echo '<pre>';
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'user' => [
                'id' => 'user_xxx',
                'email' => 'example@example.com',
                'name' => 'Example User',
                'role' => 'admin',
                'department' => null
            ],
            'token' => 'abc123xyz789...',
            'expiresAt' => '2025-10-30 12:00:00'
        ]
    ], JSON_PRETTY_PRINT);
    echo '</pre>';
    echo '</div>';
    echo '</div>';
    
    // Test 5: Password Hash Check
    echo '<div class="test">';
    echo '<h2>Test 5: Test Password Hashing</h2>';
    try {
        $testPassword = 'TestPassword123';
        $hash = password_hash($testPassword, PASSWORD_BCRYPT);
        $verify = password_verify($testPassword, $hash);
        
        echo '<div class="success">';
        echo '<p>✅ Password hashing is working correctly</p>';
        echo '<p>Test password: <code>' . htmlspecialchars($testPassword) . '</code></p>';
        echo '<p>Verification: ' . ($verify ? '✅ PASS' : '❌ FAIL') . '</p>';
        echo '</div>';
    } catch (Exception $e) {
        echo '<div class="error">';
        echo '<p>❌ Password hashing failed!</p>';
        echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
        echo '</div>';
    }
    echo '</div>';
    ?>
    
    <div class="test error">
        <h2>⚠️ IMPORTANT</h2>
        <p><strong>DELETE THIS FILE (/api/test.php) AFTER TESTING!</strong></p>
        <p>This file exposes sensitive database information and should not be left on a production server.</p>
    </div>
</body>
</html>
