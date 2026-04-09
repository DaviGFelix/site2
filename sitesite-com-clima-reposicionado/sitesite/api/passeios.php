<?php
// =====================================================
// api/passeios.php — catálogo e detalhes dos passeios
// =====================================================
// GET /api/passeios.php
// GET /api/passeios.php?id=barco-arraial-1
// Filtros opcionais: destino, categoria, destaque, search
// include_inactive=1 libera passeios inativos (uso administrativo)
// =====================================================

require_once __DIR__ . '/config.php';
handleOptions();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
}

function filterSnapshotPasseios(array $rows, array $filters, bool $includeInactive): array {
    return array_values(array_filter($rows, function (array $row) use ($filters, $includeInactive) {
        if (!$includeInactive && empty($row['ativo'])) {
            return false;
        }

        $destino = trim((string)($filters['destino'] ?? ''));
        if ($destino !== '' && (string)($row['destino'] ?? '') !== $destino) {
            return false;
        }

        $categoria = trim((string)($filters['categoria'] ?? ''));
        if ($categoria !== '' && (string)($row['categoria'] ?? '') !== $categoria) {
            return false;
        }

        $destaque = trim((string)($filters['destaque'] ?? ''));
        if ($destaque !== '' && (int)!empty($row['destaque']) !== (int)$destaque) {
            return false;
        }

        $search = mb_strtolower(trim((string)($filters['search'] ?? '')), 'UTF-8');
        if ($search !== '') {
            $haystack = mb_strtolower(implode(' ', [
                (string)($row['titulo'] ?? ''),
                (string)($row['destino'] ?? ''),
                (string)($row['categoria'] ?? ''),
                (string)($row['descricao'] ?? ''),
            ]), 'UTF-8');
            if (!str_contains($haystack, $search)) {
                return false;
            }
        }

        return true;
    }));
}

try {
    $includeInactive = isset($_GET['include_inactive']) && $_GET['include_inactive'] === '1';
    $passeioId = trim((string)($_GET['id'] ?? ''));
    $filters = [
        'destino' => $_GET['destino'] ?? '',
        'categoria' => $_GET['categoria'] ?? '',
        'destaque' => $_GET['destaque'] ?? '',
        'search' => $_GET['search'] ?? '',
    ];

    try {
        if ($passeioId !== '') {
            $passeio = getPasseioById($passeioId, $includeInactive);
            if (!$passeio) {
                jsonResponse(['success' => false, 'message' => 'Passeio não encontrado'], 404);
            }

            jsonResponse([
                'success' => true,
                'mode' => 'detail',
                'source' => 'database',
                'data' => $passeio,
                'meta' => [
                    'extended_columns' => passeioExtendedColumnsAvailable(),
                ],
            ]);
        }

        $rows = getPasseios($filters, $includeInactive);
        if ($rows) {
            saveCatalogSnapshot(fetchAllPasseiosForSnapshot(true));
        }

        jsonResponse([
            'success' => true,
            'mode' => 'list',
            'source' => 'database',
            'total' => count($rows),
            'data' => $rows,
            'meta' => [
                'extended_columns' => passeioExtendedColumnsAvailable(),
            ],
        ]);
    } catch (Throwable $dbError) {
        $snapshot = loadCatalogSnapshot();
        if (!$snapshot) {
            throw $dbError;
        }

        if ($passeioId !== '') {
            $found = null;
            foreach ($snapshot as $row) {
                if ((string)($row['id'] ?? '') === $passeioId && ($includeInactive || !empty($row['ativo']))) {
                    $found = $row;
                    break;
                }
            }

            if (!$found) {
                jsonResponse(['success' => false, 'message' => 'Passeio não encontrado'], 404);
            }

            jsonResponse([
                'success' => true,
                'mode' => 'detail',
                'source' => 'snapshot',
                'data' => $found,
                'meta' => [
                    'extended_columns' => true,
                    'fallback' => 'snapshot',
                ],
            ]);
        }

        $rows = filterSnapshotPasseios($snapshot, $filters, $includeInactive);
        jsonResponse([
            'success' => true,
            'mode' => 'list',
            'source' => 'snapshot',
            'total' => count($rows),
            'data' => $rows,
            'meta' => [
                'extended_columns' => true,
                'fallback' => 'snapshot',
            ],
        ]);
    }
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Erro interno do servidor'], 500);
}
