<?php
/**
 * ONE-TIME ADMIN SETUP SCRIPT
 * Creates the first admin account
 * 
 * USAGE:
 * 1. Upload this file to: /api/setup/create_admin.php
 * 2. Visit: https://expense.tlcachurch.org/api/setup/create_admin.php
 * 3. Fill in the form to create your admin account
 * 4. DELETE THIS FILE after creating the admin!
 */

require_once __DIR__ . '/../config/database.php';

// Generate a UUID v4
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$success = false;
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Validate
    if (empty($name) || empty($email) || empty($password)) {
        $error = 'All fields are required';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email format';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters';
    } else {
        try {
            $db = getDBConnection();
            
            // Check if admin already exists
            $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            $stmt->execute();
            $adminCount = $stmt->fetchColumn();
            
            if ($adminCount > 0) {
                $error = 'An admin account already exists. Please use the login page or contact support.';
            } else {
                // Create admin user
                $userId = generateUUID();
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);
                
                $stmt = $db->prepare("
                    INSERT INTO users (id, email, password_hash, name, role, department)
                    VALUES (?, ?, ?, ?, 'admin', NULL)
                ");
                $stmt->execute([$userId, $email, $passwordHash, $name]);
                
                $success = true;
            }
        } catch (PDOException $e) {
            $error = 'Database error: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Admin - True Light Christian Assembly</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        button:active {
            transform: translateY(0);
        }
        .alert {
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .alert-error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
        }
        .alert-success {
            background: #efe;
            border: 1px solid #cfc;
            color: #3c3;
        }
        .success-container {
            text-align: center;
        }
        .success-icon {
            font-size: 64px;
            color: #4caf50;
            margin-bottom: 20px;
        }
        .success-title {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }
        .success-text {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 13px;
        }
        .warning strong {
            display: block;
            margin-bottom: 5px;
        }
        .link {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if ($success): ?>
            <div class="success-container">
                <div class="success-icon">✅</div>
                <h1 class="success-title">Admin Account Created!</h1>
                <p class="success-text">
                    Your admin account has been successfully created.<br>
                    You can now log in to the expense tracker.
                </p>
                <div class="warning">
                    <strong>⚠️ IMPORTANT SECURITY STEP:</strong>
                    Please delete this file immediately!<br>
                    <code>/api/setup/create_admin.php</code>
                </div>
                <a href="/" class="link" style="display: inline-block; margin-top: 10px;">
                    Go to Login Page →
                </a>
            </div>
        <?php else: ?>
            <h1>Create Admin Account</h1>
            <p class="subtitle">True Light Christian Assembly - Expense Tracker</p>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                This page should only be used ONCE to create the first admin account.
                Delete this file after use!
            </div>
            
            <form method="POST">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="e.g., Pastor Jason George"
                        required
                        value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>"
                    >
                </div>
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="admin@tlcachurch.org"
                        required
                        value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                    >
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="At least 6 characters"
                        required
                        minlength="6"
                    >
                </div>
                
                <button type="submit">Create Admin Account</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
