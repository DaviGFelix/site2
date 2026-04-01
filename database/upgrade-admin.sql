-- =====================================================
-- UPGRADE DO PAINEL ADMINISTRATIVO
-- Execute uma única vez em bases já existentes.
-- =====================================================

ALTER TABLE passeios
  ADD COLUMN descricao_detalhada MEDIUMTEXT NULL AFTER descricao,
  ADD COLUMN preco_valor DECIMAL(10,2) DEFAULT NULL AFTER duracao,
  ADD COLUMN preco_label VARCHAR(80) DEFAULT NULL AFTER preco_valor,
  ADD COLUMN galeria_json LONGTEXT NULL AFTER imagem_url,
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER ativo,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE reservas
  ADD COLUMN valor_unitario_snapshot DECIMAL(10,2) DEFAULT NULL AFTER quantidade_pessoas,
  ADD COLUMN valor_label_snapshot VARCHAR(80) DEFAULT NULL AFTER valor_unitario_snapshot,
  ADD COLUMN valor_total_snapshot DECIMAL(10,2) DEFAULT NULL AFTER valor_label_snapshot;
