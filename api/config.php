<?php
// =====================================================
// api/config.php — Configuração central do sistema
// =====================================================

function configEnv(string $key, string $default = ''): string {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }

    $value = trim((string)$value);
    if ($value === '' || $value === $key) {
        return $default;
    }

    return $value;
}

defined('DB_HOST') || define('DB_HOST', configEnv('DB_HOST', 'localhost'));
defined('DB_PORT') || define('DB_PORT', configEnv('DB_PORT', '3306'));
defined('DB_NAME') || define('DB_NAME', configEnv('DB_NAME', 'simp7774_arraial_db'));
defined('DB_USER') || define('DB_USER', configEnv('DB_USER', 'simp7774_SimArraial'));
defined('DB_PASS') || define('DB_PASS', configEnv('DB_PASS', '041288Pedro*'));
defined('DB_CHARSET') || define('DB_CHARSET', configEnv('DB_CHARSET', 'utf8mb4'));

defined('WA_NUMBER') || define('WA_NUMBER', configEnv('WA_NUMBER', '5522981709100'));
defined('ADMIN_PASS') || define('ADMIN_PASS', configEnv('ADMIN_PASS', '041288Pedro*'));

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function handleOptions(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        http_response_code(204);
        exit;
    }
}

function h($value): string {
    return htmlspecialchars((string)($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function isAbsoluteUrl(?string $value): bool {
    if (!$value) return false;
    $value = trim($value);
    return (bool)preg_match('~^(https?:)?//~i', $value) || str_starts_with($value, 'data:');
}

function assetUrl(?string $value, string $relativePrefix = ''): string {
    $value = trim((string)($value ?? ''));
    if ($value === '') return '';
    return isAbsoluteUrl($value) ? $value : $relativePrefix . ltrim($value, '/');
}

function dataDirPath(): string {
    return dirname(__DIR__) . '/data';
}

function ensureDataDir(): string {
    $dir = dataDirPath();
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function catalogSnapshotPath(): string {
    return ensureDataDir() . '/passeios-catalogo.json';
}

function siteMediaPath(): string {
    return ensureDataDir() . '/site-media.json';
}

function tableHasColumn(string $table, string $column): bool {
    static $cache = [];
    $key = $table . '.' . $column;
    if (array_key_exists($key, $cache)) return $cache[$key];
    try {
        $stmt = getDB()->query("DESCRIBE `{$table}`");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $exists = in_array($column, $columns, true);
        $cache[$key] = $exists;
        return $exists;
    } catch (Throwable $e) {
        return false;
    }
}

function passeioExtendedColumnsAvailable(): bool {
    return tableHasColumn('passeios', 'preco_valor') && tableHasColumn('passeios', 'preco_label') &&
           tableHasColumn('passeios', 'descricao_detalhada') && tableHasColumn('passeios', 'galeria_json');
}

function reservasSnapshotColumnsAvailable(): bool {
    return tableHasColumn('reservas', 'valor_unitario_snapshot') &&
           tableHasColumn('reservas', 'valor_total_snapshot');
}

function passeioDeletedColumnAvailable(): bool {
    return tableHasColumn('passeios', 'deleted_at');
}

function passeioSelectColumns(string $alias = 'p'): array {
    $cols = ["{$alias}.id", "{$alias}.titulo", "{$alias}.destino", "{$alias}.categoria", "{$alias}.descricao", "{$alias}.duracao", "{$alias}.destaque", "{$alias}.imagem_url", "{$alias}.ativo", "{$alias}.created_at"];
    if (tableHasColumn('passeios', 'updated_at')) $cols[] = "{$alias}.updated_at";
    if (tableHasColumn('passeios', 'preco_valor')) $cols[] = "{$alias}.preco_valor";
    if (tableHasColumn('passeios', 'preco_label')) $cols[] = "{$alias}.preco_label";
    if (tableHasColumn('passeios', 'descricao_detalhada')) $cols[] = "{$alias}.descricao_detalhada";
    if (tableHasColumn('passeios', 'galeria_json')) $cols[] = "{$alias}.galeria_json";
    if (passeioDeletedColumnAvailable()) $cols[] = "{$alias}.deleted_at";
    return $cols;
}

function buildPasseioSelect(string $alias = 'p'): string {
    return implode(', ', passeioSelectColumns($alias));
}

function mapPasseioRow(array $row): array {
    $galeria = [];
    if (!empty($row['galeria_json'])) {
        $json = json_decode((string)$row['galeria_json'], true);
        if (is_array($json)) {
            $galeria = array_values(array_filter(array_map('trim', $json)));
        }
    }
    $row['destaque'] = (bool)(int)($row['destaque'] ?? 0);
    $row['ativo'] = (bool)(int)($row['ativo'] ?? 0);
    $row['deleted_at'] = !empty($row['deleted_at']) ? (string)$row['deleted_at'] : null;
    $row['na_lixeira'] = passeioDeletedColumnAvailable() && !empty($row['deleted_at']);
    $row['galeria'] = $galeria;
    return $row;
}

function getPasseios(array $filters = [], bool $includeInactive = false, bool $includeDeleted = false): array {
    $where = [];
    $params = [];

    if (passeioDeletedColumnAvailable() && !$includeDeleted) {
        $where[] = 'p.deleted_at IS NULL';
    }

    if (!$includeInactive) {
        $where[] = 'p.ativo = 1';
    }

    $destino = trim((string)($filters['destino'] ?? ''));
    if ($destino !== '') {
        $where[] = 'p.destino = :destino';
        $params[':destino'] = $destino;
    }

    $categoria = trim((string)($filters['categoria'] ?? ''));
    if ($categoria !== '') {
        $where[] = 'p.categoria = :categoria';
        $params[':categoria'] = $categoria;
    }

    $destaque = trim((string)($filters['destaque'] ?? ''));
    if ($destaque !== '') {
        $where[] = 'p.destaque = :destaque';
        $params[':destaque'] = (int)$destaque;
    }

    $search = trim((string)($filters['search'] ?? ''));
    if ($search !== '') {
        $where[] = '(p.titulo LIKE :search OR p.destino LIKE :search OR p.categoria LIKE :search OR p.descricao LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    $sql = 'SELECT ' . buildPasseioSelect('p') . ' FROM passeios p';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= tableHasColumn('passeios', 'updated_at')
        ? ' ORDER BY p.destaque DESC, p.updated_at DESC, p.titulo ASC'
        : ' ORDER BY p.destaque DESC, p.titulo ASC';

    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    return array_map('mapPasseioRow', $stmt->fetchAll());
}

function getPasseioById(string $id, bool $includeInactive = false, bool $includeDeleted = false): ?array {
    $sql = 'SELECT ' . buildPasseioSelect('p') . ' FROM passeios p WHERE p.id = :id';
    if (passeioDeletedColumnAvailable() && !$includeDeleted) $sql .= ' AND p.deleted_at IS NULL';
    if (!$includeInactive) $sql .= ' AND p.ativo = 1';
    $stmt = getDB()->prepare($sql . ' LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ? mapPasseioRow($row) : null;
}

function fetchAllPasseiosForSnapshot(bool $includeInactive = true, bool $includeDeleted = false): array {
    return getPasseios([], $includeInactive, $includeDeleted);
}

function saveCatalogSnapshot(?array $rows = null): bool {
    try {
        $rows = $rows ?? fetchAllPasseiosForSnapshot(true);
        $json = json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        return (bool)file_put_contents(catalogSnapshotPath(), $json);
    } catch (Throwable $e) {
        return false;
    }
}

function loadCatalogSnapshot(): array {
    $file = catalogSnapshotPath();
    if (!is_file($file)) return [];

    $raw = file_get_contents($file);
    $decoded = json_decode((string)$raw, true);
    if (!is_array($decoded)) return [];

    return array_values(array_filter(array_map(function ($row) {
        if (!is_array($row)) return null;
        $row['destaque'] = !empty($row['destaque']);
        $row['ativo'] = !array_key_exists('ativo', $row) || !empty($row['ativo']);
        $row['deleted_at'] = !empty($row['deleted_at']) ? (string)$row['deleted_at'] : null;
        $row['na_lixeira'] = !empty($row['deleted_at']);
        $row['galeria'] = array_values(array_filter(array_map('trim', (array)($row['galeria'] ?? []))));
        return $row;
    }, $decoded)));
}

function defaultSiteMediaConfig(): array {
    return [
        'asset_version' => (string)time(),
        'branding' => [
            'logo_url' => 'https://www.genspark.ai/api/files/s/eTJcP2Bb',
            'logo_alt' => 'Simplesmente Arraial do Cabo',
        ],
        'hero_slides' => [
            [
                'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=1800',
                'badge' => '⭐ Passeio em Destaque',
                'title' => 'Descubra Arraial do Cabo',
                'description' => 'Águas cristalinas e praias paradisíacas te esperam no Caribe Brasileiro',
                'primary_text' => 'Ver Passeios',
                'primary_link' => '#passeios',
                'secondary_text' => 'Saiba Mais',
                'secondary_link' => 'passeio-detalhes.html?id=barco-arraial-1',
            ],
            [
                'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/734e0371-4a94-40f9-0007-8c0a2125c300/w=1800',
                'badge' => '🎉 Festa no Mar',
                'title' => 'Búzios com Estilo',
                'description' => 'Catamarã Premium com DJ ao vivo, diversão e águas cristalinas',
                'primary_text' => 'Reservar Agora',
                'primary_link' => 'passeio-detalhes.html?id=barco-buzios-1',
                'secondary_text' => 'Explorar Mais',
                'secondary_link' => '#passeios',
            ],
            [
                'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/2d79a478-86da-48d2-cbe7-08bd92982400/w=1800',
                'badge' => '🚌 Excursões Saindo do RJ',
                'title' => 'Bate e Volta Inesquecível',
                'description' => 'Conheça os destinos mais lindos em um único dia',
                'primary_text' => 'Ver Excursões',
                'primary_link' => '#passeios',
                'secondary_text' => 'Falar Conosco',
                'secondary_link' => '#contato',
            ],
            [
                'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/50e1be52-6dd7-4fbe-1c33-7e4aab990700/w=1800',
                'badge' => '🏄 Aventura e Adrenalina',
                'title' => 'Experiências Radicais',
                'description' => 'Buggy, Quadriciclo, Mergulho e muito mais!',
                'primary_text' => 'Quero Aventura!',
                'primary_link' => '#passeios',
                'secondary_text' => 'Todos os Passeios',
                'secondary_link' => '#passeios',
            ],
        ],
        'destinos' => [
            ['key' => 'Arraial do Cabo', 'title' => 'Arraial do Cabo', 'text' => 'Praias paradisíacas com águas cristalinas', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900'],
            ['key' => 'Búzios', 'title' => 'Búzios', 'text' => 'Sofisticação e charme mediterrâneo', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'],
            ['key' => 'Cabo Frio', 'title' => 'Cabo Frio', 'text' => 'Dunas de areia branca e sol o ano todo', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/f983a0c1-e19f-4acb-55af-c07319a34800/w=900'],
            ['key' => 'Angra dos Reis', 'title' => 'Angra dos Reis', 'text' => '365 ilhas de pura beleza natural', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'],
            ['key' => 'Ilha Grande', 'title' => 'Ilha Grande', 'text' => 'Natureza intocada e praias selvagens', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b857b248-a932-41ee-e473-ec50d523b200/w=900'],
            ['key' => 'Paraty', 'title' => 'Paraty', 'text' => 'História colonial e baías deslumbrantes', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/ee406657-fc12-4b6d-db87-798f435af800/w=900'],
            ['key' => 'Rio de Janeiro', 'title' => 'Rio de Janeiro', 'text' => 'Cristo Redentor, Pão de Açúcar e muito mais', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'],
            ['key' => 'Petrópolis', 'title' => 'Petrópolis', 'text' => 'A cidade imperial da serra carioca', 'image_url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/cdcd65fc-ecda-4205-0949-03ee17d2ac00/w=900'],
        ],
        'inspira_gallery' => [
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900', 'title' => 'Caminho de areia em Arraial do Cabo', 'description' => 'Visual perfeito para destacar experiências exclusivas e passeios contemplativos.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/fd36d1b9-e256-44cc-3c40-62096b78d300/w=900', 'title' => 'Barco em água cristalina', 'description' => 'Imagem ideal para valorizar passeios de barco e experiências premium.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/7652c285-cd49-4128-bb3b-dc37371c5700/w=900', 'title' => 'Enseada com embarcações', 'description' => 'Mostra movimento, procura alta e clima de verão na região.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/080b6548-7df7-4edf-8a85-cf87e55c5700/w=1800', 'title' => 'Praia preservada vista do alto', 'description' => 'Perfeita para reforçar a beleza natural e o apelo visual do destino.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/60855586-81f2-4f44-f864-55e68ff07e00/w=1800', 'title' => 'Praia com mar verde-esmeralda', 'description' => 'Ótima para comunicar lazer, família e passeio de dia inteiro.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900', 'title' => 'Escuna turística', 'description' => 'Ajuda a contextualizar o tipo de embarcação usado nos roteiros.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c62221bc-068a-498a-3aa8-6a3561de6c00/w=900', 'title' => 'Acesso à praia por passarela', 'description' => 'Traz sensação de chegada ao paraíso e reforça o aspecto aspiracional.'],
            ['url' => 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/ee406657-fc12-4b6d-db87-798f435af800/w=900', 'title' => 'Praia selvagem com ondas', 'description' => 'Boa para destacar aventura, natureza e experiências fora do óbvio.'],
        ],
    ];
}

function normalizeSiteMediaConfig(array $config): array {
    $defaults = defaultSiteMediaConfig();
    $merged = array_replace_recursive($defaults, $config);
    $merged['hero_slides'] = array_values(array_slice((array)($merged['hero_slides'] ?? []), 0, count($defaults['hero_slides'])));
    $merged['destinos'] = array_values(array_slice((array)($merged['destinos'] ?? []), 0, count($defaults['destinos'])));
    $merged['inspira_gallery'] = array_values(array_slice((array)($merged['inspira_gallery'] ?? []), 0, count($defaults['inspira_gallery'])));
    return $merged;
}

function loadSiteMediaConfig(): array {
    $file = siteMediaPath();
    if (!is_file($file)) {
        return defaultSiteMediaConfig();
    }

    $raw = file_get_contents($file);
    $decoded = json_decode((string)$raw, true);
    if (!is_array($decoded)) {
        return defaultSiteMediaConfig();
    }

    return normalizeSiteMediaConfig($decoded);
}

function saveSiteMediaConfig(array $config): bool {
    $config['asset_version'] = (string)time();
    $normalized = normalizeSiteMediaConfig($config);
    $json = json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    return (bool)file_put_contents(siteMediaPath(), $json);
}

function reservationValueExpression(string $r = 'r', string $p = 'p'): string {
    return tableHasColumn('passeios', 'preco_valor') ? "COALESCE({$r}.quantidade_pessoas * {$p}.preco_valor, 0)" : '0';
}

function parseMoneyToFloat($value): ?float {
    if (!$value) return null;
    $text = str_replace(['R$', ' ', '.', ','], ['', '', '', '.'], trim((string)$value));
    return is_numeric($text) ? round((float)$text, 2) : null;
}

function brl(?float $value): string {
    return $value === null ? '—' : 'R$ ' . number_format($value, 2, ',', '.');
}

function slugify(string $value): string {
    $value = preg_replace('/[^a-z0-9]+/u', '-', trim(mb_strtolower($value, 'UTF-8')));
    return trim((string)$value, '-') ?: 'passeio';
}
