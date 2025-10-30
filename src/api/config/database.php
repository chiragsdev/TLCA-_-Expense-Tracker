    <?php
    /**
     * Database Configuration
     * True Light Christian Assembly - Expense Tracker
     * 
     * IMPORTANT: Update these values with your actual database credentials
     */

    // Database credentials - UPDATE DB_PASS with your actual password!
    define('DB_HOST', 'figueras.pdx1-mysql-a7-4b.dreamhost.com');
    define('DB_NAME', 'tlcaexpense');
    define('DB_USER', 'adminexpense');
    define('DB_PASS', 'mickeymouse@7700');  // ← CHANGE THIS TO YOUR ACTUAL PASSWORD
    define('DB_CHARSET', 'utf8mb4');

    // JWT Secret for session tokens - CHANGE THIS TO A RANDOM STRING!
    define('JWT_SECRET', 'change-this-to-a-random-secure-string-at-least-32-characters-long');

    // Session duration (in seconds) - 24 hours default
    define('SESSION_DURATION', 86400);

    // Upload settings
    define('UPLOAD_DIR', __DIR__ . '/../uploads/receipts/');
    define('MAX_FILE_SIZE', 10485760); // 10MB in bytes
    define('ALLOWED_FILE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']);

    // CORS settings
    define('ALLOWED_ORIGIN', 'https://expense.tlcachurch.org');

    /**
     * Get database connection using PDO
     * 
     * @return PDO Database connection
     * @throws Exception if connection fails
     */
    function getDBConnection() {
        static $pdo = null;
        
        if ($pdo === null) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ];
                
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database connection failed. Please check configuration.'
                ]);
                exit();
            }
        }
        
        return $pdo;
    }

    /**
     * Set CORS headers for API responses
     */
    function setCORSHeaders() {
        // Allow requests from the production domain
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
        header('Content-Type: application/json; charset=utf-8');
        
        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    /**
     * Send JSON response
     * 
     * @param mixed $data Data to send
     * @param int $statusCode HTTP status code
     */
    function sendJSON($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /**
     * Send error response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     */
    function sendError($message, $statusCode = 400) {
        sendJSON([
            'success' => false,
            'error' => $message
        ], $statusCode);
    }

    /**
     * Send success response
     * 
     * @param mixed $data Success data
     * @param string $message Optional success message
     */
    function sendSuccess($data = null, $message = null) {
        $response = ['success' => true];
        
        if ($message !== null) {
            $response['message'] = $message;
        }
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        sendJSON($response);
    }

    /**
     * Get request body as array
     * 
     * @return array Request body
     */
    function getRequestBody() {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON in request body', 400);
        }
        
        return $data ?? [];
    }

    /**
     * Validate required fields in data
     * 
     * @param array $data Data to validate
     * @param array $required Required field names
     * @return bool True if valid
     */
    function validateRequired($data, $required) {
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                sendError("Missing required field: $field", 400);
            }
        }
        return true;
    }

    /**
     * Log error message
     * 
     * @param string $message Error message
     * @param Exception $e Optional exception
     */
    function logError($message, $e = null) {
        $logMessage = date('Y-m-d H:i:s') . " - " . $message;
        if ($e !== null) {
            $logMessage .= " - " . $e->getMessage();
        }
        error_log($logMessage);
    }
