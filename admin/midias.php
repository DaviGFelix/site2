<?php
require_once __DIR__ . '/../api/config.php';
session_start();

if (empty($_SESSION['admin_ok'])) {
    header('Location: index.php');
    exit;
}

function adminMediaUrl(array $params = []): string {
    return 'midias.php' . ($params ? '?' . http_build_query($params) : '');
}

function salvarUploadMidia(string $fieldName): ?string {
    if (empty($_FILES[$fieldName]['name']) || ($_FILES[$fieldName]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return null;
    }

    $uploadDir = dirname(__DIR__) . '/uploads/site/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = strtolower((string)pathinfo($_FILES[$fieldName]['name'], PATHINFO_EXTENSION));
    if ($ext === '') {
        $ext = 'jpg';
    }

    $newName = uniqid('site_', true) . '.' . preg_replace('/[^a-z0-9]+/i', '', $ext);
    $target = $uploadDir . $newName;

    if (!move_uploaded_file($_FILES[$fieldName]['tmp_name'], $target)) {
        return null;
    }

    return 'uploads/site/' . $newName;
}

$siteMedia = loadSiteMediaConfig();
$msg = '';
$msgType = 'success';

if (isset($_GET['db_error']) && $_GET['db_error'] === '1') {
    $msg = 'O banco de dados do painel principal está indisponível no momento, mas você ainda pode atualizar as mídias globais do site por aqui.';
    $msgType = 'warning';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $brandingUpload = salvarUploadMidia('branding_logo');
        $siteMedia['branding']['logo_url'] = $brandingUpload ?: trim((string)($_POST['branding_logo_url'] ?? $siteMedia['branding']['logo_url'] ?? ''));
        $siteMedia['branding']['logo_alt'] = trim((string)($_POST['branding_logo_alt'] ?? $siteMedia['branding']['logo_alt'] ?? 'Simplesmente Arraial do Cabo'));

        foreach ($siteMedia['hero_slides'] as $i => $slide) {
            $upload = salvarUploadMidia('hero_image_' . $i);
            $siteMedia['hero_slides'][$i]['image_url'] = $upload ?: trim((string)($_POST['hero_image_url_' . $i] ?? $slide['image_url'] ?? ''));
            $siteMedia['hero_slides'][$i]['badge'] = trim((string)($_POST['hero_badge_' . $i] ?? $slide['badge'] ?? ''));
            $siteMedia['hero_slides'][$i]['title'] = trim((string)($_POST['hero_title_' . $i] ?? $slide['title'] ?? ''));
            $siteMedia['hero_slides'][$i]['description'] = trim((string)($_POST['hero_description_' . $i] ?? $slide['description'] ?? ''));
            $siteMedia['hero_slides'][$i]['primary_text'] = trim((string)($_POST['hero_primary_text_' . $i] ?? $slide['primary_text'] ?? ''));
            $siteMedia['hero_slides'][$i]['primary_link'] = trim((string)($_POST['hero_primary_link_' . $i] ?? $slide['primary_link'] ?? ''));
            $siteMedia['hero_slides'][$i]['secondary_text'] = trim((string)($_POST['hero_secondary_text_' . $i] ?? $slide['secondary_text'] ?? ''));
            $siteMedia['hero_slides'][$i]['secondary_link'] = trim((string)($_POST['hero_secondary_link_' . $i] ?? $slide['secondary_link'] ?? ''));
        }

        foreach ($siteMedia['destinos'] as $i => $destino) {
            $upload = salvarUploadMidia('destino_image_' . $i);
            $siteMedia['destinos'][$i]['key'] = trim((string)($_POST['destino_key_' . $i] ?? $destino['key'] ?? ''));
            $siteMedia['destinos'][$i]['title'] = trim((string)($_POST['destino_title_' . $i] ?? $destino['title'] ?? ''));
            $siteMedia['destinos'][$i]['text'] = trim((string)($_POST['destino_text_' . $i] ?? $destino['text'] ?? ''));
            $siteMedia['destinos'][$i]['image_url'] = $upload ?: trim((string)($_POST['destino_image_url_' . $i] ?? $destino['image_url'] ?? ''));
        }

        foreach ($siteMedia['inspira_gallery'] as $i => $item) {
            $upload = salvarUploadMidia('inspira_image_' . $i);
            $siteMedia['inspira_gallery'][$i]['url'] = $upload ?: trim((string)($_POST['inspira_url_' . $i] ?? $item['url'] ?? ''));
            $siteMedia['inspira_gallery'][$i]['title'] = trim((string)($_POST['inspira_title_' . $i] ?? $item['title'] ?? ''));
            $siteMedia['inspira_gallery'][$i]['description'] = trim((string)($_POST['inspira_description_' . $i] ?? $item['description'] ?? ''));
        }

        if (!saveSiteMediaConfig($siteMedia)) {
            throw new RuntimeException('Não foi possível salvar a configuração de mídias do site.');
        }

        $msg = 'Mídias globais do site atualizadas com sucesso.';
        $siteMedia = loadSiteMediaConfig();
    } catch (Throwable $e) {
        $msg = $e->getMessage() ?: 'Ocorreu um erro ao salvar as mídias do site.';
        $msgType = 'error';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mídias do Site — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
<style>
:root{--primary:#00a8cc;--primary-dark:#0b4f6c;--bg:#f4f7fb;--card:#fff;--line:#e4e7ec;--text:#1d2939;--muted:#667085;--success:#067647;--danger:#b42318;--success-bg:#ecfdf3;--danger-bg:#fef3f2}
*{box-sizing:border-box} body{margin:0;font-family:Poppins,sans-serif;background:var(--bg);color:var(--text)} a{text-decoration:none;color:inherit}
.layout{display:flex;min-height:100vh}.sidebar{width:260px;background:linear-gradient(180deg,#0b4f6c,#0086b5);color:#fff;padding:28px 18px;position:sticky;top:0;height:100vh}.brand{display:flex;gap:12px;align-items:center;margin-bottom:26px}.brand-badge{width:48px;height:48px;border-radius:16px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:1.4rem}.brand small{display:block;color:rgba(255,255,255,.75)}
.menu{display:flex;flex-direction:column;gap:8px}.menu a{padding:12px 14px;border-radius:14px;color:rgba(255,255,255,.86);display:flex;gap:10px;align-items:center}.menu a.active,.menu a:hover{background:rgba(255,255,255,.16);color:#fff}.sidebar-footer{margin-top:auto;padding-top:24px;display:flex;flex-direction:column;gap:10px}.sidebar .ghost{background:rgba(255,255,255,.14)}
.main{flex:1;padding:24px}.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px}.topbar h1{margin:0;font-size:1.7rem;color:var(--primary-dark)}.topbar p{margin:6px 0 0;color:var(--muted)}
.card{background:var(--card);border-radius:20px;padding:18px;box-shadow:0 8px 30px rgba(16,24,40,.06);border:1px solid rgba(228,231,236,.8);margin-bottom:18px}.section-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.section-title h2{margin:0;font-size:1.15rem;color:var(--primary-dark)}.section-title span{color:var(--muted);font-size:.9rem}
.alert{padding:14px 16px;border-radius:16px;margin-bottom:18px;border:1px solid transparent}.alert.success{background:var(--success-bg);color:var(--success);border-color:#a6f4c5}.alert.error{background:var(--danger-bg);color:var(--danger);border-color:#fecdca}.alert.warning{background:#fff7ed;color:#b54708;border-color:#fed7aa}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.media-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.field{display:flex;flex-direction:column;gap:6px}.field label{font-size:.84rem;color:var(--muted)} input,textarea{width:100%;padding:12px 14px;border:1px solid #d0d5dd;border-radius:12px;font:400 .94rem Poppins,sans-serif;background:#fff} textarea{min-height:90px;resize:vertical}
.preview{width:100%;max-height:220px;object-fit:cover;border-radius:16px;border:1px solid var(--line);background:#eef4f8}.slot{border:1px dashed #d0d5dd;border-radius:18px;padding:16px;background:#fcfdff}.slot h3{margin:0 0 12px;color:var(--primary-dark)}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:none;border-radius:12px;padding:11px 14px;font:500 .95rem Poppins,sans-serif;cursor:pointer;display:inline-flex;gap:8px;align-items:center;justify-content:center}.btn-primary{background:linear-gradient(135deg,#00a8cc,#0077be);color:#fff}.btn-light{background:#fff;border:1px solid var(--line);color:var(--text)}
@media (max-width:1000px){.layout{display:block}.sidebar{position:relative;height:auto;width:auto}.main{padding:18px}.grid,.media-grid{grid-template-columns:1fr}}
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
      <a href="index.php?tab=dashboard"><i class="fas fa-chart-line"></i> Dashboard</a>
      <a href="index.php?tab=reservas"><i class="fas fa-calendar-check"></i> Reservas</a>
      <a href="index.php?tab=passeios"><i class="fas fa-route"></i> Passeios</a>
      <a href="midias.php" class="active"><i class="fas fa-images"></i> Mídias do site</a>
    </nav>
    <div class="sidebar-footer">
      <a class="btn ghost" href="../" target="_blank"><i class="fas fa-up-right-from-square"></i> Abrir site</a>
      <a class="btn ghost" href="index.php?logout=1"><i class="fas fa-arrow-right-from-bracket"></i> Sair</a>
    </div>
  </aside>

  <main class="main">
    <div class="topbar">
      <div>
        <h1>Mídias globais do site</h1>
        <p>Troque logo, hero, destinos e galeria da home direto do computador, sem depender do código-fonte.</p>
      </div>
      <div class="actions">
        <a class="btn btn-light" href="index.php?tab=passeios"><i class="fas fa-route"></i> Voltar para passeios</a>
      </div>
    </div>

    <?php if ($msg): ?>
      <div class="alert <?= h($msgType) ?>"><?= h($msg) ?></div>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data">
      <div class="card">
        <div class="section-title"><h2>Logo da marca</h2><span>Usada no topo e no rodapé do site</span></div>
        <div class="media-grid" style="margin-bottom:18px">
          <div class="slot">
            <h3>Logo principal</h3>
            <img class="preview" style="object-fit:contain;background:#fff;padding:18px" src="<?= h(assetUrl($siteMedia['branding']['logo_url'] ?? '', '../')) ?>" alt="Preview da logo do site">
            <div class="field"><label>Upload do computador</label><input type="file" name="branding_logo" accept="image/*"></div>
            <div class="field"><label>Ou URL da logo</label><input type="text" name="branding_logo_url" value="<?= h($siteMedia['branding']['logo_url'] ?? '') ?>"></div>
            <div class="field"><label>Texto alternativo (SEO/acessibilidade)</label><input type="text" name="branding_logo_alt" value="<?= h($siteMedia['branding']['logo_alt'] ?? 'Simplesmente Arraial do Cabo') ?>"></div>
          </div>
        </div>

        <div class="section-title"><h2>Hero principal</h2><span>4 slides da home</span></div>
        <div class="media-grid">
          <?php foreach ($siteMedia['hero_slides'] as $i => $slide): ?>
            <div class="slot">
              <h3>Slide <?= $i + 1 ?></h3>
              <img class="preview" src="<?= h(assetUrl($slide['image_url'] ?? '', '../')) ?>" alt="Preview slide <?= $i + 1 ?>">
              <div class="field"><label>Upload do computador</label><input type="file" name="hero_image_<?= $i ?>" accept="image/*"></div>
              <div class="field"><label>Ou URL da imagem</label><input type="text" name="hero_image_url_<?= $i ?>" value="<?= h($slide['image_url'] ?? '') ?>"></div>
              <div class="field"><label>Selo</label><input type="text" name="hero_badge_<?= $i ?>" value="<?= h($slide['badge'] ?? '') ?>"></div>
              <div class="field"><label>Título</label><input type="text" name="hero_title_<?= $i ?>" value="<?= h($slide['title'] ?? '') ?>"></div>
              <div class="field"><label>Descrição</label><textarea name="hero_description_<?= $i ?>"><?= h($slide['description'] ?? '') ?></textarea></div>
              <div class="grid">
                <div class="field"><label>Botão principal</label><input type="text" name="hero_primary_text_<?= $i ?>" value="<?= h($slide['primary_text'] ?? '') ?>"></div>
                <div class="field"><label>Link principal</label><input type="text" name="hero_primary_link_<?= $i ?>" value="<?= h($slide['primary_link'] ?? '') ?>"></div>
                <div class="field"><label>Botão secundário</label><input type="text" name="hero_secondary_text_<?= $i ?>" value="<?= h($slide['secondary_text'] ?? '') ?>"></div>
                <div class="field"><label>Link secundário</label><input type="text" name="hero_secondary_link_<?= $i ?>" value="<?= h($slide['secondary_link'] ?? '') ?>"></div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h2>Cards de destinos</h2><span>Imagens e textos dos destinos da home</span></div>
        <div class="media-grid">
          <?php foreach ($siteMedia['destinos'] as $i => $destino): ?>
            <div class="slot">
              <h3><?= h($destino['key'] ?? 'Destino') ?></h3>
              <img class="preview" src="<?= h(assetUrl($destino['image_url'] ?? '', '../')) ?>" alt="Preview destino <?= $i + 1 ?>">
              <input type="hidden" name="destino_key_<?= $i ?>" value="<?= h($destino['key'] ?? '') ?>">
              <div class="field"><label>Upload do computador</label><input type="file" name="destino_image_<?= $i ?>" accept="image/*"></div>
              <div class="field"><label>Ou URL da imagem</label><input type="text" name="destino_image_url_<?= $i ?>" value="<?= h($destino['image_url'] ?? '') ?>"></div>
              <div class="field"><label>Título exibido</label><input type="text" name="destino_title_<?= $i ?>" value="<?= h($destino['title'] ?? '') ?>"></div>
              <div class="field"><label>Texto de apoio</label><textarea name="destino_text_<?= $i ?>"><?= h($destino['text'] ?? '') ?></textarea></div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h2>Galeria “Inspire-se”</h2><span>Imagens do carrossel visual da home</span></div>
        <div class="media-grid">
          <?php foreach ($siteMedia['inspira_gallery'] as $i => $item): ?>
            <div class="slot">
              <h3>Item <?= $i + 1 ?></h3>
              <img class="preview" src="<?= h(assetUrl($item['url'] ?? '', '../')) ?>" alt="Preview galeria <?= $i + 1 ?>">
              <div class="field"><label>Upload do computador</label><input type="file" name="inspira_image_<?= $i ?>" accept="image/*"></div>
              <div class="field"><label>Ou URL da imagem</label><input type="text" name="inspira_url_<?= $i ?>" value="<?= h($item['url'] ?? '') ?>"></div>
              <div class="field"><label>Título</label><input type="text" name="inspira_title_<?= $i ?>" value="<?= h($item['title'] ?? '') ?>"></div>
              <div class="field"><label>Descrição</label><textarea name="inspira_description_<?= $i ?>"><?= h($item['description'] ?? '') ?></textarea></div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" type="submit"><i class="fas fa-floppy-disk"></i> Salvar mídias do site</button>
        <a class="btn btn-light" href="<?= h(adminMediaUrl()) ?>"><i class="fas fa-rotate-left"></i> Recarregar</a>
      </div>
    </form>
  </main>
</div>
</body>
</html>
