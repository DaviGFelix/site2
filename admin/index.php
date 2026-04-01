<?php
require_once __DIR__ . '/../api/config.php';

session_start();

$erro = '';
if (isset($_POST['senha'])) {
    if ((string)$_POST['senha'] === ADMIN_PASS) {
        $_SESSION['admin_ok'] = true;
        header('Location: index.php');
        exit;
    }
    $erro = 'Senha incorreta.';
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

if (empty($_SESSION['admin_ok'])) {
    showLogin($erro);
    exit;
}

$db = null;
try {
    $db = getDB();
} catch (Throwable $e) {
    header("Location: midias.php?db_error=1");
    exit;
}

$tab = $_GET["tab"] ?? "dashboard";
$extendedColumns = passeioExtendedColumnsAvailable();
$trashColumnAvailable = passeioDeletedColumnAvailable();
$snapshotColumns = reservasSnapshotColumnsAvailable();
$valueExpr = reservationValueExpression("r", "p");
$msg = "";
$msgType = "success";
function adminUrl(array $params = []): string {
    $query = array_merge($_GET, $params);
    unset($query['logout']);
    return 'index.php' . ($query ? '?' . http_build_query($query) : '');
}

function normalizarListaUrls(string $texto): array {
    $linhas = preg_split('/\r\n|\r|\n/', $texto) ?: [];
    $urls = [];
    foreach ($linhas as $linha) {
        $linha = trim($linha);
        if ($linha !== '') {
            $urls[] = $linha;
        }
    }
    return array_values(array_unique($urls));
}

function formatarDataBr(?string $value, bool $withTime = false): string {
    if (!$value) return '—';
    $ts = strtotime($value);
    if (!$ts) return '—';
    return date($withTime ? 'd/m/Y H:i' : 'd/m/Y', $ts);
}

function showLogin(string $err = ''): void { ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin — Simplesmente Arraial do Cabo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0} body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Poppins,sans-serif;background:linear-gradient(135deg,#00a8cc,#0077be)}
.login{width:min(420px,92vw);background:#fff;padding:40px;border-radius:22px;box-shadow:0 20px 50px rgba(0,0,0,.2)}
.login h1{font-size:1.5rem;color:#0b4f6c;margin-bottom:8px}.login p{color:#65707d;margin-bottom:24px}
.login input{width:100%;padding:14px 16px;border:1px solid #d9e2ec;border-radius:12px;font:inherit;margin-bottom:14px}
.login button{width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#00a8cc,#0077be);color:#fff;font:600 1rem Poppins,sans-serif;cursor:pointer}
.login .err{margin-top:14px;color:#b42318;background:#fdebec;padding:10px 12px;border-radius:12px}.hint{margin-top:18px;font-size:.86rem;color:#667085}
</style>
</head>
<body>
<div class="login">
  <h1>🏝️ Painel Administrativo</h1>
  <p>Entre para gerenciar reservas, faturamento e passeios do site.</p>
  <form method="POST">
    <input type="password" name="senha" placeholder="Senha de acesso" required autofocus>
    <button type="submit">Entrar no painel</button>
  </form>
  <?php if ($err): ?><div class="err"><?= h($err) ?></div><?php endif; ?>
  <div class="hint">Dica: altere a senha padrão em <code>api/config.php</code> ou via variável de ambiente <code>ADMIN_PASS</code>.</div>
</div>
<script>
function escapeAdminHtml(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adminDescricaoTemHtml(texto) {
  return /<\s*(p|br|ul|ol|li|strong|em|b|i|u|h2|h3|h4|hr|a)\b/i.test(texto || '');
}

function adminLinhaLista(linha) {
  return /^([\-*•◦▪▫■□●✔✅☑️✓]|\d+[.)])\s+/u.test(linha) || /^[\u2600-\u27BF\u{1F300}-\u{1FAFF}]\s+/u.test(linha);
}

function adminLimparMarcadorLista(linha) {
  return String(linha || '').replace(/^([\-*•◦▪▫■□●✔✅☑️✓]|\d+[.)])\s+/u, '').trim();
}

function adminLinhaTitulo(linha) {
  const texto = String(linha || '').trim();
  if (!texto || adminLinhaLista(texto) || texto.length > 90) return false;
  return texto.endsWith(':') || /^[\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u.test(texto) || /^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0-9][^.!?]*$/u.test(texto);
}

function adminSanitizarHtmlBasico(html) {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  const permitidas = new Set(['P', 'BR', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'U', 'H2', 'H3', 'H4', 'HR', 'A']);

  const limparNo = (node) => {
    [...node.children].forEach((child) => {
      if (!permitidas.has(child.tagName)) {
        const fragment = document.createDocumentFragment();
        while (child.firstChild) fragment.appendChild(child.firstChild);
        child.replaceWith(fragment);
        return;
      }

      [...child.attributes].forEach((attr) => {
        const nome = attr.name.toLowerCase();
        const valor = attr.value || '';
        const permitido = child.tagName === 'A' && ['href', 'target', 'rel'].includes(nome);
        if (!permitido) {
          child.removeAttribute(attr.name);
          return;
        }
        if (nome === 'href' && !/^(https?:|mailto:|tel:|#|\/)/i.test(valor)) {
          child.removeAttribute(attr.name);
        }
      });

      if (child.tagName === 'A') {
        child.setAttribute('rel', 'noopener noreferrer');
        child.setAttribute('target', '_blank');
      }

      limparNo(child);
    });
  };

  limparNo(template.content);
  return template.innerHTML;
}

function formatarDescricaoAdmin(texto) {
  const normalizado = String(texto || '').replace(/\r\n?/g, '\n').trim();
  if (!normalizado) return '';
  if (adminDescricaoTemHtml(normalizado)) return adminSanitizarHtmlBasico(normalizado);

  return normalizado
    .split(/\n{2,}/)
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .map((bloco) => {
      const blocoSemEspacos = bloco.replace(/\s+/g, '');
      if (/^[-_]{3,}$/u.test(blocoSemEspacos)) return '<hr>';

      const linhas = bloco.split('\n').map((linha) => linha.trim()).filter(Boolean);
      if (!linhas.length) return '';
      if (linhas.length === 1 && adminLinhaTitulo(linhas[0])) return `<h3>${escapeAdminHtml(linhas[0].replace(/:$/, ''))}</h3>`;
      if (linhas.every(adminLinhaLista)) return `<ul>${linhas.map((linha) => `<li>${escapeAdminHtml(adminLimparMarcadorLista(linha))}</li>`).join('')}</ul>`;
      return `<p>${linhas.map((linha) => escapeAdminHtml(linha)).join('<br>')}</p>`;
    })
    .join('');
}

function initDescricaoPreview() {
  const campo = document.getElementById('descricao_detalhada');
  const preview = document.getElementById('descricao_detalhada_preview');
  if (!campo || !preview) return;

  const render = () => {
    const html = formatarDescricaoAdmin(campo.value);
    if (!html) {
      preview.classList.add('muted');
      preview.innerHTML = 'Digite acima para visualizar como o texto aparecerá na página do passeio.';
      return;
    }

    preview.classList.remove('muted');
    preview.innerHTML = html;
  };

  campo.addEventListener('input', render);
  render();
}

document.addEventListener('DOMContentLoaded', initDescricaoPreview);
</script>
</body>
</html>
<?php }

if (isset($_GET['export']) && $_GET['export'] === 'reservas') {
    $status = trim((string)($_GET['status'] ?? ''));
    $busca = trim((string)($_GET['busca'] ?? ''));

    $where = [];
    $params = [];
    if ($status !== '') {
        $where[] = 'r.status = :status';
        $params[':status'] = $status;
    }
    if ($busca !== '') {
        $where[] = '(r.nome_cliente LIKE :busca OR r.email_cliente LIKE :busca OR r.passeio_titulo LIKE :busca OR r.telefone_cliente LIKE :busca)';
        $params[':busca'] = '%' . $busca . '%';
    }

    $sql = "SELECT r.*, ROUND({$valueExpr}, 2) AS valor_estimado FROM reservas r LEFT JOIN passeios p ON p.id = r.passeio_id";
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY r.created_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="reservas-simplesmente-arraial.csv"');
    echo "\xEF\xBB\xBF";
    $fp = fopen('php://output', 'w');
    fputcsv($fp, ['ID', 'Passeio', 'Cliente', 'E-mail', 'Telefone', 'Data passeio', 'Horário', 'Pessoas', 'Status', 'Valor estimado', 'Criada em'], ';');
    foreach ($rows as $r) {
        fputcsv($fp, [
            $r['id'],
            $r['passeio_titulo'],
            $r['nome_cliente'],
            $r['email_cliente'],
            $r['telefone_cliente'],
            formatarDataBr($r['data_passeio']),
            $r['horario_passeio'],
            $r['quantidade_pessoas'],
            $r['status'],
            isset($r['valor_estimado']) ? brl((float)$r['valor_estimado']) : '—',
            formatarDataBr($r['created_at'], true),
        ], ';');
    }
    fclose($fp);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST['senha'])) {
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'update_status' && !empty($_POST['id']) && !empty($_POST['status'])) {
            $stmt = $db->prepare('UPDATE reservas SET status = :status WHERE id = :id');
            $stmt->execute([
                ':status' => $_POST['status'],
                ':id' => (int)$_POST['id'],
            ]);
            $msg = 'Status da reserva atualizado com sucesso.';
            $tab = 'reservas';
        }

        if ($action === 'delete_reserva' && !empty($_POST['id'])) {
            $stmt = $db->prepare('DELETE FROM reservas WHERE id = :id');
            $stmt->execute([':id' => (int)$_POST['id']]);
            $msg = 'Reserva excluída com sucesso.';
            $tab = 'reservas';
        }

        if ($action === 'toggle_passeio' && !empty($_POST['id'])) {
            $stmt = $db->prepare('UPDATE passeios SET ativo = :ativo WHERE id = :id');
            $stmt->execute([
                ':ativo' => (int)!empty($_POST['novo_status']),
                ':id' => $_POST['id'],
            ]);
            $msg = !empty($_POST['novo_status']) ? 'Passeio ativado no site.' : 'Passeio ocultado do site.';
            saveCatalogSnapshot();
            $tab = 'passeios';
        }

        if ($action === 'move_passeio_trash' && !empty($_POST['id'])) {
            if (!$trashColumnAvailable) {
                throw new RuntimeException('Para usar lixeira, execute o arquivo database/upgrade-admin.sql no MySQL para adicionar a coluna deleted_at.');
            }

            $stmt = $db->prepare('UPDATE passeios SET ativo = 0, deleted_at = NOW() WHERE id = :id');
            $stmt->execute([':id' => $_POST['id']]);
            $msg = 'Passeio movido para a lixeira com sucesso.';
            saveCatalogSnapshot();
            $tab = 'passeios';
            if (($_GET['edit'] ?? '') === ($_POST['id'] ?? '')) {
                $_GET['edit'] = '';
            }
        }

        if ($action === 'restore_passeio' && !empty($_POST['id'])) {
            if (!$trashColumnAvailable) {
                throw new RuntimeException('A restauração da lixeira requer a coluna deleted_at. Execute o upgrade do banco primeiro.');
            }

            $stmt = $db->prepare('UPDATE passeios SET deleted_at = NULL WHERE id = :id');
            $stmt->execute([':id' => $_POST['id']]);
            $msg = 'Passeio restaurado da lixeira. Ele continuará oculto até você ativá-lo novamente.';
            saveCatalogSnapshot();
            $tab = 'passeios';
        }

        if ($action === 'delete_passeio_forever' && !empty($_POST['id'])) {
            $stmt = $db->prepare('DELETE FROM passeios WHERE id = :id');
            $stmt->execute([':id' => $_POST['id']]);
            $msg = 'Passeio removido permanentemente do banco de dados.';
            saveCatalogSnapshot();
            $tab = 'passeios';
            if (($_GET['edit'] ?? '') === ($_POST['id'] ?? '')) {
                $_GET['edit'] = '';
            }
        }

        if ($action === 'save_passeio') {
            if (!$extendedColumns) {
                throw new RuntimeException('Seu banco ainda não possui as colunas novas. Execute o arquivo database/upgrade-admin.sql antes de salvar passeios no painel.');
            }

            $originalId = trim((string)($_POST['original_id'] ?? ''));
            $titulo = trim((string)($_POST['titulo'] ?? ''));
            $destino = trim((string)($_POST['destino'] ?? ''));
            $categoria = trim((string)($_POST['categoria'] ?? ''));
            $descricao = trim((string)($_POST['descricao'] ?? ''));
            $descricaoDetalhada = trim((string)($_POST['descricao_detalhada'] ?? ''));
            $duracao = trim((string)($_POST['duracao'] ?? ''));
            $precoValor = parseMoneyToFloat($_POST['preco_valor'] ?? null);
            $precoLabel = trim((string)($_POST['preco_label'] ?? ''));
            $imagemUrl = trim((string)($_POST['imagem_url'] ?? ''));
            $galeriaUrls = normalizarListaUrls((string)($_POST['galeria_urls'] ?? ''));
            $ativo = !empty($_POST['ativo']) ? 1 : 0;
            $destaque = !empty($_POST['destaque']) ? 1 : 0;

            // --- INÍCIO DA LÓGICA DE UPLOAD ---
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            // Processar Capa Principal
            if (!empty($_FILES['imagem_arquivo']['name'])) {
                $ext = pathinfo($_FILES['imagem_arquivo']['name'], PATHINFO_EXTENSION);
                $newName = uniqid('capa_') . '.' . $ext;
                if (move_uploaded_file($_FILES['imagem_arquivo']['tmp_name'], $uploadDir . $newName)) {
                    $imagemUrl = 'uploads/' . $newName;
                }
            }

            // Processar Galeria Múltipla
            if (!empty($_FILES['galeria_arquivos']['name'][0])) {
                $newPhotos = [];
                foreach ($_FILES['galeria_arquivos']['tmp_name'] as $k => $tmp) {
                    if ($_FILES['galeria_arquivos']['error'][$k] === UPLOAD_ERR_OK) {
                        $ext = pathinfo($_FILES['galeria_arquivos']['name'][$k], PATHINFO_EXTENSION);
                        $newName = uniqid('galeria_') . '.' . $ext;
                        if (move_uploaded_file($tmp, $uploadDir . $newName)) $newPhotos[] = 'uploads/' . $newName;
                    }
                }
                if ($newPhotos) $galeriaUrls = array_merge($galeriaUrls, $newPhotos);
            }
            // --- FIM DA LÓGICA DE UPLOAD ---

            if ($titulo === '' || $categoria === '') {
                throw new RuntimeException('Preencha ao menos título e categoria do passeio.');
            }

            if ($precoLabel === '' && $precoValor !== null) {
                $precoLabel = 'A partir de R$ ' . number_format($precoValor, 2, ',', '.');
            }

            if ($imagemUrl === '' && $galeriaUrls) {
                $imagemUrl = $galeriaUrls[0];
            }
            if (!$galeriaUrls && $imagemUrl !== '') {
                $galeriaUrls[] = $imagemUrl;
            }

            if ($originalId !== '') {
                $stmt = $db->prepare('UPDATE passeios SET
                    titulo = :titulo,
                    destino = :destino,
                    categoria = :categoria,
                    descricao = :descricao,
                    descricao_detalhada = :descricao_detalhada,
                    duracao = :duracao,
                    preco_valor = :preco_valor,
                    preco_label = :preco_label,
                    imagem_url = :imagem_url,
                    galeria_json = :galeria_json,
                    destaque = :destaque,
                    ativo = :ativo
                    WHERE id = :id');

                $stmt->execute([
                    ':titulo' => $titulo,
                    ':destino' => $destino,
                    ':categoria' => $categoria,
                    ':descricao' => $descricao,
                    ':descricao_detalhada' => $descricaoDetalhada ?: null,
                    ':duracao' => $duracao ?: null,
                    ':preco_valor' => $precoValor,
                    ':preco_label' => $precoLabel ?: null,
                    ':imagem_url' => $imagemUrl ?: null,
                    ':galeria_json' => $galeriaUrls ? json_encode($galeriaUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                    ':destaque' => $destaque,
                    ':ativo' => $ativo,
                    ':id' => $originalId,
                ]);

                $msg = 'Passeio atualizado com sucesso.';
                $editId = $originalId;
            } else {
                $baseId = slugify((string)($_POST['id'] ?? $titulo));
                $id = $baseId;
                $sufixo = 1;
                while (getPasseioById($id, true)) {
                    $id = $baseId . '-' . $sufixo;
                    $sufixo++;
                }

                $stmt = $db->prepare('INSERT INTO passeios
                    (id, titulo, destino, categoria, descricao, descricao_detalhada, duracao, preco_valor, preco_label, destaque, imagem_url, galeria_json, ativo)
                    VALUES
                    (:id, :titulo, :destino, :categoria, :descricao, :descricao_detalhada, :duracao, :preco_valor, :preco_label, :destaque, :imagem_url, :galeria_json, :ativo)');

                $stmt->execute([
                    ':id' => $id,
                    ':titulo' => $titulo,
                    ':destino' => $destino,
                    ':categoria' => $categoria,
                    ':descricao' => $descricao,
                    ':descricao_detalhada' => $descricaoDetalhada ?: null,
                    ':duracao' => $duracao ?: null,
                    ':preco_valor' => $precoValor,
                    ':preco_label' => $precoLabel ?: null,
                    ':destaque' => $destaque,
                    ':imagem_url' => $imagemUrl ?: null,
                    ':galeria_json' => $galeriaUrls ? json_encode($galeriaUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                    ':ativo' => $ativo,
                ]);

                $msg = 'Novo passeio cadastrado com sucesso.';
                $editId = $id;
            }

            saveCatalogSnapshot();
            $tab = 'passeios';
            $_GET['edit'] = $editId ?? '';
        }
    } catch (Throwable $e) {
        $msg = $e->getMessage() ?: 'Ocorreu um erro ao processar a ação.';
        $msgType = 'error';
    }
}

$statusFiltro = trim((string)($_GET['status'] ?? ''));
$buscaReserva = trim((string)($_GET['busca'] ?? ''));
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

$whereReservas = [];
$paramsReservas = [];
if ($statusFiltro !== '') {
    $whereReservas[] = 'r.status = :status';
    $paramsReservas[':status'] = $statusFiltro;
}
if ($buscaReserva !== '') {
    $whereReservas[] = '(r.nome_cliente LIKE :busca OR r.email_cliente LIKE :busca OR r.telefone_cliente LIKE :busca OR r.passeio_titulo LIKE :busca)';
    $paramsReservas[':busca'] = '%' . $buscaReserva . '%';
}
$whereReservasSql = $whereReservas ? ' WHERE ' . implode(' AND ', $whereReservas) : '';

$stmtTotal = $db->prepare("SELECT COUNT(*) FROM reservas r LEFT JOIN passeios p ON p.id = r.passeio_id {$whereReservasSql}");
$stmtTotal->execute($paramsReservas);
$totalReservasFiltradas = (int)$stmtTotal->fetchColumn();
$totalPages = max(1, (int)ceil($totalReservasFiltradas / $limit));

$sqlReservas = "SELECT r.*, ROUND({$valueExpr}, 2) AS valor_estimado
    FROM reservas r
    LEFT JOIN passeios p ON p.id = r.passeio_id
    {$whereReservasSql}
    ORDER BY r.created_at DESC
    LIMIT :limit OFFSET :offset";
$stmtReservas = $db->prepare($sqlReservas);
foreach ($paramsReservas as $k => $v) {
    $stmtReservas->bindValue($k, $v);
}
$stmtReservas->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmtReservas->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmtReservas->execute();
$reservas = $stmtReservas->fetchAll();

$stats = $db->query("SELECT
    COUNT(*) AS total_reservas,
    SUM(r.status = 'pendente') AS pendentes,
    SUM(r.status = 'confirmada') AS confirmadas,
    SUM(r.status = 'cancelada') AS canceladas,
    COALESCE(SUM(r.quantidade_pessoas), 0) AS total_pessoas,
    ROUND(COALESCE(SUM(CASE WHEN r.status = 'confirmada' THEN {$valueExpr} ELSE 0 END), 0), 2) AS faturamento_confirmado,
    ROUND(COALESCE(SUM(CASE WHEN r.status IN ('pendente', 'confirmada') THEN {$valueExpr} ELSE 0 END), 0), 2) AS faturamento_previsto
    FROM reservas r
    LEFT JOIN passeios p ON p.id = r.passeio_id")->fetch();

if ($trashColumnAvailable) {
    $passeioStats = $db->query("SELECT
        SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) AS total_passeios,
        SUM(CASE WHEN deleted_at IS NULL AND ativo = 1 THEN 1 ELSE 0 END) AS passeios_ativos,
        SUM(CASE WHEN deleted_at IS NULL AND ativo = 0 THEN 1 ELSE 0 END) AS passeios_inativos,
        SUM(CASE WHEN deleted_at IS NULL AND destaque = 1 THEN 1 ELSE 0 END) AS passeios_destaque,
        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) AS passeios_lixeira,
        COUNT(DISTINCT CASE WHEN deleted_at IS NULL AND destino <> '' THEN destino END) AS total_destinos
        FROM passeios")->fetch();
} else {
    $passeioStats = $db->query("SELECT
        COUNT(*) AS total_passeios,
        SUM(ativo = 1) AS passeios_ativos,
        SUM(ativo = 0) AS passeios_inativos,
        SUM(destaque = 1) AS passeios_destaque,
        COUNT(DISTINCT NULLIF(destino, '')) AS total_destinos,
        0 AS passeios_lixeira
        FROM passeios")->fetch();
}

$monthly = $db->query("SELECT
    DATE_FORMAT(r.created_at, '%Y-%m') AS periodo,
    COUNT(*) AS total_reservas,
    ROUND(COALESCE(SUM(CASE WHEN r.status = 'confirmada' THEN {$valueExpr} ELSE 0 END), 0), 2) AS faturamento
    FROM reservas r
    LEFT JOIN passeios p ON p.id = r.passeio_id
    GROUP BY DATE_FORMAT(r.created_at, '%Y-%m')
    ORDER BY periodo DESC
    LIMIT 6")->fetchAll();
$monthly = array_reverse($monthly ?: []);
$maiorFaturamento = 0.0;
foreach ($monthly as $item) {
    $maiorFaturamento = max($maiorFaturamento, (float)$item['faturamento']);
}

$buscaPasseio = trim((string)($_GET['busca_passeio'] ?? ''));
$statusPasseio = trim((string)($_GET['status_passeio'] ?? ''));
$wherePasseios = [];
$paramsPasseios = [];

if ($buscaPasseio !== '') {
    $wherePasseios[] = '(p.titulo LIKE :busca_passeio OR p.destino LIKE :busca_passeio OR p.categoria LIKE :busca_passeio OR p.id LIKE :busca_passeio)';
    $paramsPasseios[':busca_passeio'] = '%' . $buscaPasseio . '%';
}

if ($trashColumnAvailable) {
    if ($statusPasseio === 'trash') {
        $wherePasseios[] = 'p.deleted_at IS NOT NULL';
    } else {
        $wherePasseios[] = 'p.deleted_at IS NULL';
        if ($statusPasseio === '1' || $statusPasseio === '0') {
            $wherePasseios[] = 'p.ativo = :status_passeio';
            $paramsPasseios[':status_passeio'] = (int)$statusPasseio;
        }
    }
} elseif ($statusPasseio !== '') {
    $wherePasseios[] = 'p.ativo = :status_passeio';
    $paramsPasseios[':status_passeio'] = (int)$statusPasseio;
}

$sqlPasseios = 'SELECT ' . buildPasseioSelect('p') . ' FROM passeios p';
if ($wherePasseios) {
    $sqlPasseios .= ' WHERE ' . implode(' AND ', $wherePasseios);
}
$sqlPasseios .= tableHasColumn('passeios', 'updated_at')
    ? ' ORDER BY p.destaque DESC, p.updated_at DESC, p.titulo ASC'
    : ' ORDER BY p.destaque DESC, p.titulo ASC';

$stmtPasseios = $db->prepare($sqlPasseios);
$stmtPasseios->execute($paramsPasseios);
$passeios = array_map('mapPasseioRow', $stmtPasseios->fetchAll());

$editId = trim((string)($_GET['edit'] ?? ''));
$editPasseio = [
    'id' => '',
    'titulo' => '',
    'destino' => '',
    'categoria' => '',
    'descricao' => '',
    'descricao_detalhada' => '',
    'duracao' => '',
    'preco_valor' => null,
    'preco_label' => '',
    'imagem_url' => '',
    'galeria' => [],
    'ativo' => true,
    'destaque' => false,
];
if ($editId !== '') {
    $found = getPasseioById($editId, true);
    if ($found) {
        $editPasseio = array_merge($editPasseio, $found);
    }
}

$destinos = $db->query("SELECT DISTINCT destino FROM passeios WHERE destino <> '' ORDER BY destino ASC")->fetchAll(PDO::FETCH_COLUMN);
$categorias = $db->query("SELECT DISTINCT categoria FROM passeios WHERE categoria <> '' ORDER BY categoria ASC")->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin — Simplesmente Arraial do Cabo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<style>
:root{--primary:#00a8cc;--primary-dark:#0b4f6c;--bg:#f4f7fb;--card:#fff;--line:#e4e7ec;--text:#1d2939;--muted:#667085;--success:#067647;--warning:#b54708;--danger:#b42318;--success-bg:#ecfdf3;--warning-bg:#fff7ed;--danger-bg:#fef3f2}
*{box-sizing:border-box} body{margin:0;font-family:Poppins,sans-serif;background:var(--bg);color:var(--text)} a{text-decoration:none;color:inherit}
.layout{display:flex;min-height:100vh}.sidebar{width:260px;background:linear-gradient(180deg,#0b4f6c,#0086b5);color:#fff;padding:28px 18px;position:sticky;top:0;height:100vh}.brand{display:flex;gap:12px;align-items:center;margin-bottom:26px}.brand-badge{width:48px;height:48px;border-radius:16px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:1.4rem}.brand small{display:block;color:rgba(255,255,255,.75)}
.menu{display:flex;flex-direction:column;gap:8px}.menu a{padding:12px 14px;border-radius:14px;color:rgba(255,255,255,.86);display:flex;gap:10px;align-items:center}.menu a.active,.menu a:hover{background:rgba(255,255,255,.16);color:#fff}.sidebar-footer{margin-top:auto;padding-top:24px;display:flex;flex-direction:column;gap:10px}.sidebar .ghost{background:rgba(255,255,255,.14)}
.main{flex:1;padding:24px}.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px}.topbar h1{margin:0;font-size:1.7rem;color:var(--primary-dark)}.topbar p{margin:6px 0 0;color:var(--muted)}
.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:none;border-radius:12px;padding:11px 14px;font:500 .95rem Poppins,sans-serif;cursor:pointer;display:inline-flex;gap:8px;align-items:center;justify-content:center}.btn-primary{background:linear-gradient(135deg,#00a8cc,#0077be);color:#fff}.btn-light{background:#fff;border:1px solid var(--line);color:var(--text)}.btn-danger{background:var(--danger-bg);color:var(--danger)}.btn-success{background:var(--success-bg);color:var(--success)}.btn-warning{background:var(--warning-bg);color:var(--warning)}
.alert{padding:14px 16px;border-radius:16px;margin-bottom:18px;border:1px solid transparent}.alert.success{background:var(--success-bg);color:var(--success);border-color:#a6f4c5}.alert.error{background:var(--danger-bg);color:var(--danger);border-color:#fecdca}.alert.warning{background:var(--warning-bg);color:var(--warning);border-color:#fed7aa}
.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}.card{background:var(--card);border-radius:20px;padding:18px;box-shadow:0 8px 30px rgba(16,24,40,.06);border:1px solid rgba(228,231,236,.8)}.stat .label{color:var(--muted);font-size:.92rem}.stat .value{font-size:1.9rem;font-weight:700;margin-top:6px}.stat .sub{margin-top:8px;color:var(--muted);font-size:.84rem}
.grid-2{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-bottom:20px}.section-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.section-title h2{margin:0;font-size:1.15rem;color:var(--primary-dark)}.section-title span{color:var(--muted);font-size:.9rem}
.chart-list{display:flex;flex-direction:column;gap:12px}.chart-row{display:grid;grid-template-columns:92px 1fr 150px;gap:12px;align-items:center}.chart-bar-wrap{height:12px;background:#eef4f8;border-radius:999px;overflow:hidden}.chart-bar{height:100%;background:linear-gradient(90deg,#00a8cc,#0b4f6c);border-radius:999px}
.filters{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-bottom:16px}.filters .field{display:flex;flex-direction:column;gap:6px;min-width:180px;flex:1}.filters label{font-size:.84rem;color:var(--muted)} input,select,textarea{width:100%;padding:12px 14px;border:1px solid #d0d5dd;border-radius:12px;font:400 .94rem Poppins,sans-serif;background:#fff} textarea{min-height:110px;resize:vertical}
.table-wrap{overflow:auto}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:14px 12px;border-bottom:1px solid #eef2f6;text-align:left;vertical-align:top}.table th{font-size:.82rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);background:#fbfcfe;position:sticky;top:0}.table tr:hover td{background:#fcfdff}.tag{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:.78rem;font-weight:600}.tag.success{background:var(--success-bg);color:var(--success)}.tag.warning{background:var(--warning-bg);color:var(--warning)}.tag.danger{background:var(--danger-bg);color:var(--danger)}.tag.info{background:#eef8ff;color:#0b4f6c}
.kpis{display:flex;gap:8px;flex-wrap:wrap}.muted{color:var(--muted)}.small{font-size:.84rem}.nowrap{white-space:nowrap}.pill-actions{display:flex;gap:8px;flex-wrap:wrap}.pagination{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px}.pagination a{padding:8px 12px;background:#fff;border:1px solid var(--line);border-radius:10px}.pagination a.active{background:var(--primary);color:#fff;border-color:transparent}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.form-grid .span-2{grid-column:1 / -1}.checkbox-row{display:flex;gap:16px;flex-wrap:wrap}.checkbox{display:flex;align-items:center;gap:8px;background:#f8fafc;padding:12px 14px;border-radius:12px;border:1px solid #e9eef5}.checkbox input{width:auto;margin:0}
.table td .inline-form{display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap}.thumb{width:54px;height:54px;border-radius:12px;object-fit:cover;background:#eef4f8}.empty{padding:28px;text-align:center;color:var(--muted)}.section{display:none}.section.active{display:block}.field-hint{display:block;margin-top:8px;color:var(--muted);font-size:.82rem;line-height:1.6}.preview-box{margin-top:14px;padding:16px;border:1px solid #d0d5dd;border-radius:16px;background:#fcfdff}.preview-box h3{margin:0 0 10px;color:var(--primary-dark);font-size:1rem}.preview-rich > *:first-child{margin-top:0}.preview-rich > *:last-child{margin-bottom:0}.preview-rich p{margin:0 0 14px;line-height:1.8}.preview-rich h3,.preview-rich h4{margin:20px 0 10px;color:var(--primary-dark)}.preview-rich ul,.preview-rich ol{list-style:none;padding:0;margin:0 0 14px}.preview-rich li{position:relative;padding-left:26px;margin-bottom:10px;line-height:1.6}.preview-rich li:before{content:'✓';position:absolute;left:0;color:var(--primary);font-weight:700}.preview-rich hr{border:0;border-top:1px solid #e4e7ec;margin:18px 0}
@media (max-width:1200px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-2{grid-template-columns:1fr}.chart-row{grid-template-columns:82px 1fr 110px}}
@media (max-width:900px){.layout{display:block}.sidebar{position:relative;height:auto;width:auto}.main{padding:18px}.form-grid{grid-template-columns:1fr}.cards{grid-template-columns:1fr}.chart-row{grid-template-columns:1fr}.chart-row span:last-child{text-align:left}.table th,.table td{padding:12px 10px}}
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-badge">🏖️</div>
      <div>
        <strong>Simplesmente Arraial</strong>
        <small>Painel completo do site</small>
      </div>
    </div>

    <nav class="menu">
      <a href="<?= h(adminUrl(['tab' => 'dashboard'])) ?>" class="<?= $tab === 'dashboard' ? 'active' : '' ?>"><i class="fas fa-chart-line"></i> Dashboard</a>
      <a href="<?= h(adminUrl(['tab' => 'reservas'])) ?>" class="<?= $tab === 'reservas' ? 'active' : '' ?>"><i class="fas fa-calendar-check"></i> Reservas</a>
      <a href="<?= h(adminUrl(['tab' => 'passeios'])) ?>" class="<?= $tab === 'passeios' ? 'active' : '' ?>"><i class="fas fa-route"></i> Passeios</a>
      <a href="midias.php"><i class="fas fa-images"></i> Mídias do site</a>
    </nav>

    <div class="sidebar-footer">
      <a class="btn ghost" href="../" target="_blank"><i class="fas fa-up-right-from-square"></i> Abrir site</a>
      <a class="btn ghost" href="?logout=1"><i class="fas fa-arrow-right-from-bracket"></i> Sair</a>
    </div>
  </aside>

  <main class="main">
    <div class="topbar">
      <div>
        <h1>Painel de Administração</h1>
        <p>Controle reservas, faturamento, catálogo de passeios e o que está ativo no site.</p>
      </div>
      <div class="actions">
        <a class="btn btn-light" href="../api/passeios.php" target="_blank"><i class="fas fa-code"></i> Ver API</a>
        <a class="btn btn-primary" href="<?= h(adminUrl(['tab' => 'passeios', 'edit' => ''])) ?>"><i class="fas fa-plus"></i> Novo passeio</a>
      </div>
    </div>

    <?php if ($msg): ?>
      <div class="alert <?= h($msgType) ?>"><?= h($msg) ?></div>
    <?php endif; ?>

    <?php if (!$extendedColumns): ?>
      <div class="alert warning">
        Seu banco ainda não foi atualizado para o painel completo. Para editar preços, descrição detalhada e galeria direto no admin, execute o arquivo <strong>database/upgrade-admin.sql</strong> no MySQL.
      </div>
    <?php endif; ?>

    <?php if (!$trashColumnAvailable): ?>
      <div class="alert warning">
        O botão de lixeira dos passeios depende da coluna <strong>deleted_at</strong>. Para liberar a exclusão para lixeira e restauração, execute novamente o arquivo <strong>database/upgrade-admin.sql</strong>.
      </div>
    <?php endif; ?>

    <section class="section <?= $tab === 'dashboard' ? 'active' : '' ?>">
      <div class="cards">
        <div class="card stat"><div class="label">Reservas totais</div><div class="value"><?= (int)($stats['total_reservas'] ?? 0) ?></div><div class="sub">Todas as solicitações recebidas</div></div>
        <div class="card stat"><div class="label">Confirmadas</div><div class="value"><?= (int)($stats['confirmadas'] ?? 0) ?></div><div class="sub">Pendentes: <?= (int)($stats['pendentes'] ?? 0) ?> • Canceladas: <?= (int)($stats['canceladas'] ?? 0) ?></div></div>
        <div class="card stat"><div class="label">Faturamento confirmado</div><div class="value"><?= h(brl(isset($stats['faturamento_confirmado']) ? (float)$stats['faturamento_confirmado'] : null)) ?></div><div class="sub">Com base em reservas confirmadas</div></div>
        <div class="card stat"><div class="label">Faturamento previsto</div><div class="value"><?= h(brl(isset($stats['faturamento_previsto']) ? (float)$stats['faturamento_previsto'] : null)) ?></div><div class="sub">Pendentes + confirmadas</div></div>
      </div>

      <div class="cards">
        <div class="card stat"><div class="label">Passeios ativos</div><div class="value"><?= (int)($passeioStats['passeios_ativos'] ?? 0) ?></div><div class="sub">Visíveis no site agora</div></div>
        <div class="card stat"><div class="label">Passeios ocultos</div><div class="value"><?= (int)($passeioStats['passeios_inativos'] ?? 0) ?></div><div class="sub">Desativados no catálogo</div></div>
        <div class="card stat"><div class="label">Passeios em destaque</div><div class="value"><?= (int)($passeioStats['passeios_destaque'] ?? 0) ?></div><div class="sub">Com priorização visual</div></div>
        <div class="card stat"><div class="label">Na lixeira</div><div class="value"><?= (int)($passeioStats['passeios_lixeira'] ?? 0) ?></div><div class="sub">Podem ser restaurados ou excluídos</div></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="section-title"><h2>Faturamento por mês</h2><span>Últimos 6 meses</span></div>
          <?php if (!$monthly): ?>
            <div class="empty">Ainda não há dados suficientes para exibir a evolução mensal.</div>
          <?php else: ?>
            <div class="chart-list">
              <?php foreach ($monthly as $item):
                $valor = (float)$item['faturamento'];
                $largura = $maiorFaturamento > 0 ? max(8, (int)(($valor / $maiorFaturamento) * 100)) : 8;
              ?>
                <div class="chart-row">
                  <span class="small muted"><?= h(date('m/Y', strtotime($item['periodo'] . '-01'))) ?></span>
                  <div class="chart-bar-wrap"><div class="chart-bar" style="width: <?= $largura ?>%"></div></div>
                  <span class="small nowrap"><?= h(brl($valor)) ?> · <?= (int)$item['total_reservas'] ?> reserva(s)</span>
                </div>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
        </div>

        <div class="card">
          <div class="section-title"><h2>Resumo operacional</h2><span>Visão rápida</span></div>
          <div class="kpis">
            <span class="tag success"><i class="fas fa-user-group"></i> <?= (int)($stats['total_pessoas'] ?? 0) ?> pessoas atendidas</span>
            <span class="tag info"><i class="fas fa-layer-group"></i> <?= (int)($passeioStats['total_passeios'] ?? 0) ?> passeios cadastrados</span>
            <span class="tag warning"><i class="fas fa-clock"></i> <?= (int)($stats['pendentes'] ?? 0) ?> aguardando retorno</span>
            <span class="tag danger"><i class="fas fa-ban"></i> <?= (int)($stats['canceladas'] ?? 0) ?> canceladas</span>
          </div>
          <p class="muted" style="margin-top:16px;line-height:1.7">Use a aba <strong>Reservas</strong> para confirmar pedidos e responder clientes rápido. Na aba <strong>Passeios</strong> você consegue ajustar título, preço, galeria, descrição, destaques e ativação do que aparece no site.</p>
        </div>
      </div>
    </section>

    <section class="section <?= $tab === 'reservas' ? 'active' : '' ?>">
      <div class="card">
        <div class="section-title">
          <h2>Controle de reservas</h2>
          <span><?= $totalReservasFiltradas ?> resultado(s)</span>
        </div>

        <form method="GET" class="filters">
          <input type="hidden" name="tab" value="reservas">
          <div class="field">
            <label>Buscar cliente ou passeio</label>
            <input type="text" name="busca" value="<?= h($buscaReserva) ?>" placeholder="Nome, e-mail, telefone ou passeio">
          </div>
          <div class="field" style="max-width:220px">
            <label>Status</label>
            <select name="status">
              <option value="">Todos</option>
              <option value="pendente" <?= $statusFiltro === 'pendente' ? 'selected' : '' ?>>Pendente</option>
              <option value="confirmada" <?= $statusFiltro === 'confirmada' ? 'selected' : '' ?>>Confirmada</option>
              <option value="cancelada" <?= $statusFiltro === 'cancelada' ? 'selected' : '' ?>>Cancelada</option>
            </select>
          </div>
          <div class="actions">
            <button class="btn btn-primary" type="submit"><i class="fas fa-filter"></i> Filtrar</button>
            <a class="btn btn-light" href="<?= h(adminUrl(['tab' => 'reservas', 'status' => '', 'busca' => '', 'page' => 1])) ?>"><i class="fas fa-rotate-left"></i> Limpar</a>
            <a class="btn btn-success" href="<?= h(adminUrl(['tab' => 'reservas', 'export' => 'reservas'])) ?>"><i class="fas fa-file-csv"></i> Exportar CSV</a>
          </div>
        </form>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Passeio</th>
                <th>Data</th>
                <th>Pessoas</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Criado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
            <?php if (!$reservas): ?>
              <tr><td colspan="9" class="empty">Nenhuma reserva encontrada.</td></tr>
            <?php else: foreach ($reservas as $r):
              $statusClass = $r['status'] === 'confirmada' ? 'success' : ($r['status'] === 'cancelada' ? 'danger' : 'warning');
              $telWa = preg_replace('/[^0-9]/', '', (string)$r['telefone_cliente']);
              if ($telWa && strlen($telWa) <= 11) $telWa = '55' . $telWa;
              $msgWa = urlencode('Olá ' . $r['nome_cliente'] . '! Aqui é da Simplesmente Arraial do Cabo. Sobre sua reserva de "' . $r['passeio_titulo'] . '" para ' . formatarDataBr($r['data_passeio']) . ', vamos te passar as informações.');
            ?>
              <tr>
                <td class="nowrap"><strong>#<?= (int)$r['id'] ?></strong></td>
                <td>
                  <strong><?= h($r['nome_cliente']) ?></strong><br>
                  <span class="small muted"><?= h($r['email_cliente']) ?></span><br>
                  <span class="small muted"><?= h($r['telefone_cliente']) ?></span>
                </td>
                <td>
                  <strong><?= h($r['passeio_titulo']) ?></strong><br>
                  <span class="small muted">Horário: <?= h($r['horario_passeio'] ?: '—') ?></span>
                </td>
                <td class="nowrap"><?= h(formatarDataBr($r['data_passeio'])) ?></td>
                <td><?= (int)$r['quantidade_pessoas'] ?></td>
                <td class="nowrap"><?= h(isset($r['valor_estimado']) ? brl((float)$r['valor_estimado']) : '—') ?></td>
                <td>
                  <form method="POST" class="inline-form">
                    <input type="hidden" name="action" value="update_status">
                    <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
                    <select name="status" onchange="this.form.submit()">
                      <option value="pendente" <?= $r['status'] === 'pendente' ? 'selected' : '' ?>>Pendente</option>
                      <option value="confirmada" <?= $r['status'] === 'confirmada' ? 'selected' : '' ?>>Confirmada</option>
                      <option value="cancelada" <?= $r['status'] === 'cancelada' ? 'selected' : '' ?>>Cancelada</option>
                    </select>
                  </form>
                  <div style="margin-top:8px"><span class="tag <?= $statusClass ?>"><?= h(ucfirst($r['status'])) ?></span></div>
                </td>
                <td class="nowrap"><?= h(formatarDataBr($r['created_at'], true)) ?></td>
                <td>
                  <div class="pill-actions">
                    <?php if ($telWa): ?>
                      <a class="btn btn-success" target="_blank" href="https://wa.me/<?= h($telWa) ?>?text=<?= $msgWa ?>"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    <?php endif; ?>
                    <form method="POST" onsubmit="return confirm('Excluir esta reserva?')">
                      <input type="hidden" name="action" value="delete_reserva">
                      <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
                      <button class="btn btn-danger" type="submit"><i class="fas fa-trash"></i> Excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            <?php endforeach; endif; ?>
            </tbody>
          </table>
        </div>

        <?php if ($totalPages > 1): ?>
          <div class="pagination">
            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
              <a href="<?= h(adminUrl(['tab' => 'reservas', 'page' => $i])) ?>" class="<?= $i === $page ? 'active' : '' ?>"><?= $i ?></a>
            <?php endfor; ?>
          </div>
        <?php endif; ?>
      </div>
    </section>

    <section class="section <?= $tab === 'passeios' ? 'active' : '' ?>">
      <div class="grid-2">
        <div class="card">
          <div class="section-title">
            <h2><?= $editPasseio['id'] ? 'Editar passeio' : 'Cadastrar novo passeio' ?></h2>
            <span><?= $editPasseio['id'] ? 'ID: ' . h($editPasseio['id']) : 'Novo registro' ?></span>
          </div>

          <form method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="save_passeio">
            <input type="hidden" name="original_id" value="<?= h($editPasseio['id']) ?>">

            <div class="form-grid">
              <div>
                <label>Título</label>
                <input type="text" name="titulo" required value="<?= h($editPasseio['titulo']) ?>">
              </div>
              <div>
                <label>ID amigável <?= $editPasseio['id'] ? '(somente leitura após criado)' : '(opcional)' ?></label>
                <input type="text" name="id" value="<?= h($editPasseio['id']) ?>" <?= $editPasseio['id'] ? 'readonly' : '' ?> placeholder="ex.: barco-arraial-premium">
              </div>
              <div>
                <label>Destino</label>
                <input list="lista-destinos" type="text" name="destino" value="<?= h($editPasseio['destino']) ?>" placeholder="Arraial do Cabo, Búzios...">
              </div>
              <div>
                <label>Categoria</label>
                <input list="lista-categorias" type="text" name="categoria" value="<?= h($editPasseio['categoria']) ?>" required placeholder="Barco, Buggy, Transfer...">
              </div>
              <div>
                <label>Duração</label>
                <input type="text" name="duracao" value="<?= h($editPasseio['duracao']) ?>" placeholder="4 horas">
              </div>
              <div>
                <label>Preço base (número)</label>
                <input type="text" name="preco_valor" value="<?= $editPasseio['preco_valor'] !== null ? h(number_format((float)$editPasseio['preco_valor'], 2, ',', '.')) : '' ?>" placeholder="99,90">
              </div>
              <div class="span-2">
                <label>Texto de preço exibido no site</label>
                <input type="text" name="preco_label" value="<?= h($editPasseio['preco_label']) ?>" placeholder="A partir de R$ 99,90">
              </div>
              <div class="span-2">
                <label>Descrição curta</label>
                <textarea name="descricao" placeholder="Texto resumido que aparece nos cards e detalhes."><?= h($editPasseio['descricao']) ?></textarea>
              </div>
              <div class="span-2">
                <label>Descrição detalhada (HTML opcional)</label>
                <textarea id="descricao_detalhada" name="descricao_detalhada" placeholder="Cole texto normal com linhas em branco entre parágrafos ou, se preferir, use HTML simples."><?= h($editPasseio['descricao_detalhada']) ?></textarea>
                <small class="field-hint">Agora o site formata automaticamente texto comum em parágrafos, títulos e listas. Se você já usar HTML simples, ele também será mantido.</small>
                <div class="preview-box">
                  <h3>Pré-visualização da descrição</h3>
                  <div id="descricao_detalhada_preview" class="preview-rich muted">Digite acima para visualizar como o texto aparecerá na página do passeio.</div>
                </div>
              </div>
              <div class="span-2">
                <label>Imagem principal (Upload do PC)</label>
                <input type="file" name="imagem_arquivo" accept="image/*" style="margin-bottom:8px">
                <label>Ou use uma URL externa</label>
                <input type="url" name="imagem_url" value="<?= h($editPasseio['imagem_url'] ?? '') ?>" placeholder="https://...">
              </div>
              <div class="span-2">
                <label>Galeria de fotos (Selecione vários arquivos no computador)</label>
                <input type="file" name="galeria_arquivos[]" accept="image/*" multiple style="margin-bottom:8px">
                <label>Ou cole as URLs da galeria (uma por linha)</label>
                <textarea name="galeria_urls" placeholder="https://imagem-1.jpg&#10;https://imagem-2.jpg"><?= h(implode(PHP_EOL, $editPasseio['galeria'] ?? [])) ?></textarea>
              </div>
              <div class="span-2 checkbox-row">
                <label class="checkbox"><input type="checkbox" name="ativo" value="1" <?= !empty($editPasseio['ativo']) ? 'checked' : '' ?>> Mostrar no site</label>
                <label class="checkbox"><input type="checkbox" name="destaque" value="1" <?= !empty($editPasseio['destaque']) ? 'checked' : '' ?>> Marcar como destaque</label>
              </div>
            </div>

            <div class="actions" style="margin-top:16px">
              <button class="btn btn-primary" type="submit"><i class="fas fa-floppy-disk"></i> Salvar passeio</button>
              <a class="btn btn-light" href="<?= h(adminUrl(['tab' => 'passeios', 'edit' => ''])) ?>"><i class="fas fa-eraser"></i> Limpar formulário</a>
            </div>
          </form>

          <datalist id="lista-destinos">
            <?php foreach ($destinos as $destino): ?><option value="<?= h($destino) ?>"><?php endforeach; ?>
          </datalist>
          <datalist id="lista-categorias">
            <?php foreach ($categorias as $categoria): ?><option value="<?= h($categoria) ?>"><?php endforeach; ?>
          </datalist>
        </div>

        <div class="card">
          <div class="section-title"><h2>Regras de uso</h2><span>Integração do site</span></div>
          <div class="kpis">
            <span class="tag info"><i class="fas fa-link"></i> Home integrada com a API</span>
            <span class="tag info"><i class="fas fa-image"></i> Galeria controlada pelo admin</span>
            <span class="tag info"><i class="fas fa-money-bill-wave"></i> Faturamento calculado no painel</span>
          </div>
          <p class="muted" style="margin-top:16px;line-height:1.7">Sempre que você salvar um passeio, o catálogo da home e a página de detalhes passam a refletir esses dados pela API. Se quiser tirar um destino do ar temporariamente, basta desativar o passeio na lista abaixo. Se quiser removê-lo da operação sem apagar de vez, use a lixeira para poder restaurar depois.</p>
          <?php if (!$extendedColumns): ?>
            <div class="alert warning" style="margin-top:16px">O formulário acima depende das colunas novas no banco. Execute o upgrade SQL para liberar preço, descrição detalhada e galeria no admin.</div>
          <?php endif; ?>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h2>Todos os passeios</h2><span><?= count($passeios) ?> item(ns)</span></div>

        <form method="GET" class="filters">
          <input type="hidden" name="tab" value="passeios">
          <div class="field">
            <label>Buscar passeio</label>
            <input type="text" name="busca_passeio" value="<?= h($buscaPasseio) ?>" placeholder="Título, destino, categoria ou ID">
          </div>
          <div class="field" style="max-width:220px">
            <label>Status</label>
            <select name="status_passeio">
              <option value="" <?= $statusPasseio === '' ? 'selected' : '' ?>>Ativos + ocultos</option>
              <option value="1" <?= $statusPasseio === '1' ? 'selected' : '' ?>>Ativos</option>
              <option value="0" <?= $statusPasseio === '0' ? 'selected' : '' ?>>Ocultos</option>
              <?php if ($trashColumnAvailable): ?>
                <option value="trash" <?= $statusPasseio === 'trash' ? 'selected' : '' ?>>Na lixeira</option>
              <?php endif; ?>
            </select>
          </div>
          <div class="actions">
            <button class="btn btn-primary" type="submit"><i class="fas fa-filter"></i> Filtrar</button>
            <a class="btn btn-light" href="<?= h(adminUrl(['tab' => 'passeios', 'busca_passeio' => '', 'status_passeio' => '', 'edit' => ''])) ?>"><i class="fas fa-rotate-left"></i> Limpar</a>
          </div>
        </form>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Passeio</th>
                <th>Destino / Categoria</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Destaque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
            <?php if (!$passeios): ?>
              <tr><td colspan="7" class="empty">Nenhum passeio encontrado.</td></tr>
            <?php else: foreach ($passeios as $p): ?>
              <tr>
                <td><?php if (!empty($p['imagem_url'])): ?><img class="thumb" src="<?= h(assetUrl($p['imagem_url'], '../')) ?>" alt="<?= h($p['titulo']) ?>"><?php else: ?><div class="thumb"></div><?php endif; ?></td>
                <td>
                  <strong><?= h($p['titulo']) ?></strong><br>
                  <span class="small muted">ID: <?= h($p['id']) ?></span>
                </td>
                <td>
                  <strong><?= h($p['destino'] ?: 'Sem destino') ?></strong><br>
                  <span class="small muted"><?= h($p['categoria']) ?></span>
                </td>
                <td class="nowrap"><?= h($p['preco_label'] ?: ($p['preco_valor'] !== null ? brl((float)$p['preco_valor']) : 'Consulte-nos')) ?></td>
                <td>
                  <?php if (!empty($p['na_lixeira'])): ?>
                    <span class="tag warning">Na lixeira</span>
                  <?php else: ?>
                    <span class="tag <?= !empty($p['ativo']) ? 'success' : 'danger' ?>"><?= !empty($p['ativo']) ? 'Ativo' : 'Oculto' ?></span>
                  <?php endif; ?>
                </td>
                <td>
                  <span class="tag <?= !empty($p['destaque']) ? 'info' : 'warning' ?>"><?= !empty($p['destaque']) ? 'Destaque' : 'Normal' ?></span>
                </td>
                <td>
                  <div class="pill-actions">
                    <a class="btn btn-light" href="<?= h(adminUrl(['tab' => 'passeios', 'edit' => $p['id']])) ?>"><i class="fas fa-pen"></i> Editar</a>

                    <?php if (!empty($p['na_lixeira'])): ?>
                      <form method="POST" onsubmit="return confirm('Restaurar este passeio da lixeira? Ele continuará oculto até você ativá-lo novamente.')">
                        <input type="hidden" name="action" value="restore_passeio">
                        <input type="hidden" name="id" value="<?= h($p['id']) ?>">
                        <button class="btn btn-success" type="submit"><i class="fas fa-trash-arrow-up"></i> Restaurar</button>
                      </form>
                      <form method="POST" onsubmit="return confirm('Excluir este passeio permanentemente? Essa ação não poderá ser desfeita.')">
                        <input type="hidden" name="action" value="delete_passeio_forever">
                        <input type="hidden" name="id" value="<?= h($p['id']) ?>">
                        <button class="btn btn-danger" type="submit"><i class="fas fa-trash-can"></i> Excluir de vez</button>
                      </form>
                    <?php else: ?>
                      <form method="POST">
                        <input type="hidden" name="action" value="toggle_passeio">
                        <input type="hidden" name="id" value="<?= h($p['id']) ?>">
                        <input type="hidden" name="novo_status" value="<?= !empty($p['ativo']) ? '0' : '1' ?>">
                        <button class="btn <?= !empty($p['ativo']) ? 'btn-warning' : 'btn-success' ?>" type="submit">
                          <i class="fas <?= !empty($p['ativo']) ? 'fa-eye-slash' : 'fa-eye' ?>"></i>
                          <?= !empty($p['ativo']) ? 'Ocultar' : 'Ativar' ?>
                        </button>
                      </form>
                      <form method="POST" onsubmit="return confirm('Mover este passeio para a lixeira? Você poderá restaurá-lo depois.')">
                        <input type="hidden" name="action" value="move_passeio_trash">
                        <input type="hidden" name="id" value="<?= h($p['id']) ?>">
                        <button class="btn btn-danger" type="submit"><i class="fas fa-trash"></i> Lixeira</button>
                      </form>
                    <?php endif; ?>
                  </div>
                </td>
              </tr>
            <?php endforeach; endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</div>
<script>
function escapeAdminHtml(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adminDescricaoTemHtml(texto) {
  return /<\s*(p|br|ul|ol|li|strong|em|b|i|u|h2|h3|h4|hr|a)\b/i.test(texto || '');
}

function adminLinhaLista(linha) {
  return /^([\-*•◦▪▫■□●✔✅☑️✓]|\d+[.)])\s+/u.test(linha) || /^[\u2600-\u27BF\u{1F300}-\u{1FAFF}]\s+/u.test(linha);
}

function adminLimparMarcadorLista(linha) {
  return String(linha || '').replace(/^([\-*•◦▪▫■□●✔✅☑️✓]|\d+[.)])\s+/u, '').trim();
}

function adminLinhaTitulo(linha) {
  const texto = String(linha || '').trim();
  if (!texto || adminLinhaLista(texto) || texto.length > 90) return false;
  return texto.endsWith(':') || /^[\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u.test(texto) || /^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0-9][^.!?]*$/u.test(texto);
}

function adminSanitizarHtmlBasico(html) {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  const permitidas = new Set(['P', 'BR', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'U', 'H2', 'H3', 'H4', 'HR', 'A']);

  const limparNo = (node) => {
    [...node.children].forEach((child) => {
      if (!permitidas.has(child.tagName)) {
        const fragment = document.createDocumentFragment();
        while (child.firstChild) fragment.appendChild(child.firstChild);
        child.replaceWith(fragment);
        return;
      }

      [...child.attributes].forEach((attr) => {
        const nome = attr.name.toLowerCase();
        const valor = attr.value || '';
        const permitido = child.tagName === 'A' && ['href', 'target', 'rel'].includes(nome);
        if (!permitido) {
          child.removeAttribute(attr.name);
          return;
        }
        if (nome === 'href' && !/^(https?:|mailto:|tel:|#|\/)/i.test(valor)) {
          child.removeAttribute(attr.name);
        }
      });

      if (child.tagName === 'A') {
        child.setAttribute('rel', 'noopener noreferrer');
        child.setAttribute('target', '_blank');
      }

      limparNo(child);
    });
  };

  limparNo(template.content);
  return template.innerHTML;
}

function formatarDescricaoAdmin(texto) {
  const normalizado = String(texto || '').replace(/\r\n?/g, '\n').trim();
  if (!normalizado) return '';
  if (adminDescricaoTemHtml(normalizado)) return adminSanitizarHtmlBasico(normalizado);

  return normalizado
    .split(/\n{2,}/)
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .map((bloco) => {
      const blocoSemEspacos = bloco.replace(/\s+/g, '');
      if (/^[-_]{3,}$/u.test(blocoSemEspacos)) return '<hr>';

      const linhas = bloco.split('\n').map((linha) => linha.trim()).filter(Boolean);
      if (!linhas.length) return '';
      if (linhas.length === 1 && adminLinhaTitulo(linhas[0])) return `<h3>${escapeAdminHtml(linhas[0].replace(/:$/, ''))}</h3>`;
      if (linhas.every(adminLinhaLista)) return `<ul>${linhas.map((linha) => `<li>${escapeAdminHtml(adminLimparMarcadorLista(linha))}</li>`).join('')}</ul>`;
      return `<p>${linhas.map((linha) => escapeAdminHtml(linha)).join('<br>')}</p>`;
    })
    .join('');
}

function initDescricaoPreview() {
  const campo = document.getElementById('descricao_detalhada');
  const preview = document.getElementById('descricao_detalhada_preview');
  if (!campo || !preview) return;

  const render = () => {
    const html = formatarDescricaoAdmin(campo.value);
    if (!html) {
      preview.classList.add('muted');
      preview.innerHTML = 'Digite acima para visualizar como o texto aparecerá na página do passeio.';
      return;
    }

    preview.classList.remove('muted');
    preview.innerHTML = html;
  };

  campo.addEventListener('input', render);
  render();
}

document.addEventListener('DOMContentLoaded', initDescricaoPreview);
</script>
</body>
</html>
