<?php
// =====================================================
// api/reservas.php — registro de reservas
// =====================================================
// Body JSON esperado:
//   passeio_id, passeio_titulo, nome_cliente,
//   email_cliente, telefone_cliente, data_passeio,
//   horario_passeio, quantidade_pessoas, observacoes
// =====================================================

require_once __DIR__ . '/config.php';
handleOptions();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    jsonResponse(['success' => false, 'message' => 'Payload inválido'], 400);
}

$required = [
    'passeio_id',
    'passeio_titulo',
    'nome_cliente',
    'email_cliente',
    'telefone_cliente',
    'data_passeio',
    'horario_passeio',
    'quantidade_pessoas',
];

$missing = [];
foreach ($required as $field) {
    if (empty($body[$field])) {
        $missing[] = $field;
    }
}

if ($missing) {
    jsonResponse([
        'success' => false,
        'message' => 'Campos obrigatórios faltando: ' . implode(', ', $missing),
    ], 422);
}

if (!filter_var($body['email_cliente'], FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'E-mail inválido'], 422);
}

$dataParsed = date_create($body['data_passeio']);
if (!$dataParsed || $dataParsed < new DateTime('today')) {
    jsonResponse(['success' => false, 'message' => 'Data do passeio inválida ou no passado'], 422);
}

$qtd = (int)$body['quantidade_pessoas'];
if ($qtd < 1 || $qtd > 100) {
    jsonResponse(['success' => false, 'message' => 'Quantidade de pessoas inválida'], 422);
}

$passeioId = substr(trim((string)$body['passeio_id']), 0, 60);
$passeioTit = substr(trim((string)$body['passeio_titulo']), 0, 300);
$nomeCliente = substr(trim((string)$body['nome_cliente']), 0, 255);
$emailCliente = strtolower(trim((string)$body['email_cliente']));
$telCliente = preg_replace('/[^0-9+\-() ]/', '', (string)$body['telefone_cliente']);
$telCliente = substr($telCliente, 0, 30);
$dataPasseio = $dataParsed->format('Y-m-d');
$horario = substr(trim((string)$body['horario_passeio']), 0, 20);
$obs = substr(trim((string)($body['observacoes'] ?? '')), 0, 2000);
$ip = $_SERVER['REMOTE_ADDR'] ?? null;

$valorUnitario = null;
$valorLabel = null;
$valorTotal = null;

try {
    $passeioDb = getPasseioById($passeioId, true);
    if ($passeioDb) {
        if (!$passeioDb['ativo']) {
            jsonResponse(['success' => false, 'message' => 'Este passeio não está disponível para reserva no momento'], 422);
        }

        $minPermitido = max(1, (int)($passeioDb['min_pessoas'] ?? 1));
        $maxPermitido = max($minPermitido, min(100, (int)($passeioDb['max_pessoas'] ?? 100)));
        if ($qtd < $minPermitido || $qtd > $maxPermitido) {
            jsonResponse(['success' => false, 'message' => "A quantidade permitida para este passeio é de {$minPermitido} a {$maxPermitido} pessoa(s)."], 422);
        }

        $horariosPermitidos = array_values(array_filter((array)($passeioDb['horarios'] ?? []), fn($item) => trim((string)$item) !== ''));
        if (!empty($passeioDb['permitir_a_combinar'])) {
            $horariosPermitidos[] = 'A combinar';
        }
        $horariosPermitidos = array_values(array_unique(array_map('trim', $horariosPermitidos)));
        if ($horariosPermitidos && !in_array($horario, $horariosPermitidos, true)) {
            jsonResponse(['success' => false, 'message' => 'O horário selecionado não está disponível para este passeio.'], 422);
        }

        $passeioTit = $passeioDb['titulo'] ?: $passeioTit;
        $valorLabel = $passeioDb['preco_label'] ?: null;
        $valorUnitario = $passeioDb['preco_valor'] ?? null;
        if ($valorUnitario !== null) {
            $valorTotal = round($valorUnitario * $qtd, 2);
        }
    }

    $db = getDB();

    if (reservasSnapshotColumnsAvailable()) {
        $sql = 'INSERT INTO reservas
            (
                passeio_id, passeio_titulo, nome_cliente, email_cliente,
                telefone_cliente, data_passeio, horario_passeio,
                quantidade_pessoas, valor_unitario_snapshot,
                valor_label_snapshot, valor_total_snapshot,
                observacoes, ip_origem
            )
            VALUES
            (
                :pid, :ptit, :nome, :email,
                :tel, :data, :hor,
                :qtd, :valor_unit, :valor_label, :valor_total,
                :obs, :ip
            )';

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':pid' => $passeioId,
            ':ptit' => $passeioTit,
            ':nome' => $nomeCliente,
            ':email' => $emailCliente,
            ':tel' => $telCliente,
            ':data' => $dataPasseio,
            ':hor' => $horario,
            ':qtd' => $qtd,
            ':valor_unit' => $valorUnitario,
            ':valor_label' => $valorLabel,
            ':valor_total' => $valorTotal,
            ':obs' => $obs,
            ':ip' => $ip,
        ]);
    } else {
        $sql = 'INSERT INTO reservas
            (
                passeio_id, passeio_titulo, nome_cliente, email_cliente,
                telefone_cliente, data_passeio, horario_passeio,
                quantidade_pessoas, observacoes, ip_origem
            )
            VALUES
            (
                :pid, :ptit, :nome, :email,
                :tel, :data, :hor,
                :qtd, :obs, :ip
            )';

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':pid' => $passeioId,
            ':ptit' => $passeioTit,
            ':nome' => $nomeCliente,
            ':email' => $emailCliente,
            ':tel' => $telCliente,
            ':data' => $dataPasseio,
            ':hor' => $horario,
            ':qtd' => $qtd,
            ':obs' => $obs,
            ':ip' => $ip,
        ]);
    }

    $reservaId = $db->lastInsertId();
    $dataFmt = (new DateTime($dataPasseio))->format('d/m/Y');
    $msg = urlencode(
        "🌊 *Nova Reserva - Simplesmente Arraial do Cabo*\n\n"
        . "📋 *Passeio:* {$passeioTit}\n"
        . "👤 *Cliente:* {$nomeCliente}\n"
        . "📧 *E-mail:* {$emailCliente}\n"
        . "📱 *Telefone:* {$telCliente}\n"
        . "📅 *Data:* {$dataFmt}\n"
        . "⏰ *Horário:* {$horario}\n"
        . "👥 *Pessoas:* {$qtd}\n"
        . ($valorLabel ? "💰 *Valor:* {$valorLabel}\n" : '')
        . ($valorTotal !== null ? "🧾 *Total estimado:* " . brl($valorTotal) . "\n" : '')
        . ($obs ? "📝 *Obs:* {$obs}\n" : '')
        . "\n_ID da reserva: #{$reservaId}_"
    );

    $waLink = 'https://wa.me/' . WA_NUMBER . '?text=' . $msg;

    jsonResponse([
        'success' => true,
        'message' => 'Reserva registrada com sucesso!',
        'reserva_id' => $reservaId,
        'whatsapp' => $waLink,
        'meta' => [
            'valor_label' => $valorLabel,
            'valor_total' => $valorTotal,
        ],
    ], 201);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Erro ao salvar reserva'], 500);
}
