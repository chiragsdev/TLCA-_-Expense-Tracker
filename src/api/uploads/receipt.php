<?php
/**
 * Upload Receipt Endpoint
 * Handles receipt file uploads
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/verify.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $user = verifyAuth();
    
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
        sendError('No file uploaded', 400);
    }
    
    $file = $_FILES['file'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server upload limit',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form upload limit',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        
        $message = $errorMessages[$file['error']] ?? 'Unknown upload error';
        sendError($message, 500);
    }
    
    // Validate file size
    if ($file['size'] > MAX_FILE_SIZE) {
        sendError('File too large. Maximum size: ' . (MAX_FILE_SIZE / 1048576) . 'MB', 400);
    }
    
    // Validate file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, ALLOWED_FILE_TYPES)) {
        sendError('Invalid file type. Allowed types: images (JPEG, PNG, GIF, WebP) and PDF', 400);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'receipt_' . uniqid() . '_' . time() . '.' . $extension;
    $filepath = UPLOAD_DIR . $filename;
    
    // Create upload directory if it doesn't exist
    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        sendError('Failed to save file', 500);
    }
    
    // Generate URL
    $url = 'https://expense.tlcachurch.org/api/uploads/receipts/' . $filename;
    
    sendSuccess([
        'url' => $url,
        'filename' => $filename,
        'size' => $file['size'],
        'type' => $mimeType
    ], 'Receipt uploaded successfully');
    
} catch (Exception $e) {
    logError('Upload receipt error', $e);
    sendError('Failed to upload receipt', 500);
}
