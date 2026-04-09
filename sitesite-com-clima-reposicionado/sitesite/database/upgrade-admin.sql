-- =====================================================
-- UPGRADE DO PAINEL ADMINISTRATIVO
-- Execute uma única vez em bases já existentes.
-- =====================================================

ALTER TABLE passeios
  ADD COLUMN IF NOT EXISTS descricao_detalhada MEDIUMTEXT NULL AFTER descricao,
  ADD COLUMN IF NOT EXISTS preco_valor DECIMAL(10,2) DEFAULT NULL AFTER duracao,
  ADD COLUMN IF NOT EXISTS preco_label VARCHAR(80) DEFAULT NULL AFTER preco_valor,
  ADD COLUMN IF NOT EXISTS galeria_json LONGTEXT NULL AFTER imagem_url,
  ADD COLUMN IF NOT EXISTS horarios_json LONGTEXT NULL AFTER galeria_json,
  ADD COLUMN IF NOT EXISTS idiomas_json LONGTEXT NULL AFTER horarios_json,
  ADD COLUMN IF NOT EXISTS grupos_label VARCHAR(160) DEFAULT NULL AFTER idiomas_json,
  ADD COLUMN IF NOT EXISTS destaques_json LONGTEXT NULL AFTER grupos_label,
  ADD COLUMN IF NOT EXISTS garantias_json LONGTEXT NULL AFTER destaques_json,
  ADD COLUMN IF NOT EXISTS min_pessoas TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER garantias_json,
  ADD COLUMN IF NOT EXISTS max_pessoas TINYINT UNSIGNED NOT NULL DEFAULT 50 AFTER min_pessoas,
  ADD COLUMN IF NOT EXISTS permitir_a_combinar TINYINT(1) NOT NULL DEFAULT 1 AFTER max_pessoas,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL AFTER ativo,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS valor_unitario_snapshot DECIMAL(10,2) DEFAULT NULL AFTER quantidade_pessoas,
  ADD COLUMN IF NOT EXISTS valor_label_snapshot VARCHAR(80) DEFAULT NULL AFTER valor_unitario_snapshot,
  ADD COLUMN IF NOT EXISTS valor_total_snapshot DECIMAL(10,2) DEFAULT NULL AFTER valor_label_snapshot;
