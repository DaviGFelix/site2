<?php
require_once __DIR__ . '/config.php';
handleOptions();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
}

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

jsonResponse([
    'success' => true,
    'data' => loadSiteMediaConfig(),
]);
