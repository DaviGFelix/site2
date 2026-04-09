-- =====================================================
-- BANCO DE DADOS: simplesmente_arraial
-- Sistema de Reservas - Simplesmente Arraial do Cabo
-- =====================================================

CREATE DATABASE IF NOT EXISTS simplesmente_arraial
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE simplesmente_arraial;

-- =====================================================
-- TABELA: passeios
-- =====================================================
CREATE TABLE IF NOT EXISTS passeios (
  id                  VARCHAR(60)  NOT NULL,
  titulo              VARCHAR(300) NOT NULL,
  destino             VARCHAR(100) NOT NULL DEFAULT '',
  categoria           VARCHAR(100) NOT NULL,
  descricao           TEXT,
  descricao_detalhada MEDIUMTEXT,
  duracao             VARCHAR(60),
  preco_valor         DECIMAL(10,2) DEFAULT NULL,
  preco_label         VARCHAR(80) DEFAULT NULL,
  destaque            TINYINT(1)   NOT NULL DEFAULT 0,
  imagem_url          VARCHAR(600),
  galeria_json        LONGTEXT,
  horarios_json       LONGTEXT,
  idiomas_json        LONGTEXT,
  grupos_label        VARCHAR(160) DEFAULT NULL,
  destaques_json      LONGTEXT,
  garantias_json      LONGTEXT,
  min_pessoas         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  max_pessoas         TINYINT UNSIGNED NOT NULL DEFAULT 50,
  permitir_a_combinar TINYINT(1) NOT NULL DEFAULT 1,
  ativo               TINYINT(1)   NOT NULL DEFAULT 1,
  deleted_at          TIMESTAMP NULL DEFAULT NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_destino  (destino),
  INDEX idx_categoria (categoria),
  INDEX idx_ativo    (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: reservas
-- =====================================================
CREATE TABLE IF NOT EXISTS reservas (
  id                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  passeio_id            VARCHAR(60)     NOT NULL,
  passeio_titulo        VARCHAR(300)    NOT NULL,
  nome_cliente          VARCHAR(255)    NOT NULL,
  email_cliente         VARCHAR(255)    NOT NULL,
  telefone_cliente      VARCHAR(30)     NOT NULL,
  data_passeio          DATE            NOT NULL,
  horario_passeio       VARCHAR(20),
  quantidade_pessoas    TINYINT UNSIGNED NOT NULL DEFAULT 1,
  valor_unitario_snapshot DECIMAL(10,2) DEFAULT NULL,
  valor_label_snapshot  VARCHAR(80) DEFAULT NULL,
  valor_total_snapshot  DECIMAL(10,2) DEFAULT NULL,
  observacoes           TEXT,
  status                ENUM('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
  ip_origem             VARCHAR(45),
  created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_passeio   (passeio_id),
  INDEX idx_status    (status),
  INDEX idx_data      (data_passeio),
  INDEX idx_criado    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED: Todos os passeios do passeios-data.js
-- =====================================================
INSERT INTO passeios (id, titulo, destino, categoria, descricao, duracao, destaque, imagem_url) VALUES

-- ===== BARCO – ARRAIAL DO CABO =====
('barco-arraial-1','Passeio de Barco 2 andares com escorrega em Arraial do Cabo','Arraial do Cabo','Barco','Visite as principais praias de Arraial do Cabo em um passeio de 4 horas com água gratuita e cortesia de frutas','4 horas',1,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900'),
('barco-arraial-2','Passeio de Barco Open bar em Arraial do Cabo','Arraial do Cabo','Barco','Conheça as principais praias de Arraial do Cabo em um passeio de barco de 4 horas que conta com água, refrigerante e caipirinha inclusos','4 horas',1,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/fd36d1b9-e256-44cc-3c40-62096b78d300/w=900'),
('barco-arraial-3','Passeio de Barco Premium em Arraial do Cabo','Arraial do Cabo','Barco','Aproveite 5 Horas de duração e atendimento diferenciado! A melhor opção para quem quer aproveitar ao máximo sua experiência em Arraial do Cabo!','5 horas',1,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/7652c285-cd49-4128-bb3b-dc37371c5700/w=900'),

-- ===== BARCO – BÚZIOS =====
('barco-buzios-1','Catamarã Premium em Búzios','Búzios','Barco','Curta 3 horas de passeio nas águas cristalinas de Búzios com DJ Blindado a bordo, pista de dança e muita diversão na melhor vibe de Búzios','3 horas',1,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('barco-buzios-2','Passeio de Escuna em Búzios','Búzios','Barco','Visite a costa central de Búzios em um passeio de barco com 2:30 de duração visitando 12 praias e 3 Ilhas, incluindo João Fernandes','2.5 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/76b0fcc5-5b5b-454c-6bd9-012c991fbf00/w=900'),
('barco-buzios-3','Passeio de Escuna 2 andares com tobogã em Búzios','Búzios','Barco','Conheça 12 praias e 3 Ilhas em um passeio de barco incrível na costa central da Armação de Búzios, barco de 2 andares com tobogã e piscina infantil','4 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/90d4618d-d2fb-4884-1e5d-5ecc60022500/w=900'),

-- ===== BARCO – CABO FRIO =====
('barco-cabofrio-1','Passeio de Catamarã em Cabo Frio','Cabo Frio','Barco','Conheça a famosa Ilha do Japão e a Praia do Forte em um passeio de catamarã com duração de 3 horas pelas belas paisagens de Cabo Frio','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/f983a0c1-e19f-4acb-55af-c07319a34800/w=900'),

-- ===== BARCO – ANGRA DOS REIS =====
('barco-angra-1','Passeio de Escuna Angra dos Reis','Angra dos Reis','Barco','Conheça as principais praias e ilhas da região em um passeio de escuna de 5 horas e meia de duração','5.5 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'),

-- ===== BARCO – ILHA GRANDE =====
('barco-ilha-1','Caipirinha Tour Ilha Grande','Ilha Grande','Barco','Conheça o Caipirinha Tour, um passeio para quem quer se divertir e aproveitar as praias mais lindas da Ilha Grande','6 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b857b248-a932-41ee-e473-ec50d523b200/w=900'),
('lancha-ilha-1','Passeio de Lancha Super Lagoa Azul','Ilha Grande','Lancha','Conheça a famosa Lagoa Azul em um passeio de 6 horas com descida nas praias e paradas para mergulho!','6 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/e7b1c185-5b19-4a0f-6c73-9449e9e8bd00/w=900'),
('lancha-ilha-2','Passeio de Lancha Ilhas Paradisíacas','Ilha Grande','Lancha','Conheça as Ilhas mais lindas da Ilha Grande em um passeio de 6 horas com descida nas praias e paradas para mergulho!','6 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/10b90790-7cd3-41a3-83ca-2895be6a2e00/w=900'),
('lancha-ilha-3','Passeio de Lancha Gruta do Açaí','Ilha Grande','Lancha','Conheça a Gruta do Açaí, uma misteriosa caverna na Ilha Grande onde ocorre um fenômeno natural incrível!','6 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/36c16097-9b3b-423d-495c-c10c60736700/w=900'),

-- ===== BARCO – PARATY =====
('barco-paraty-1','Passeio de Escuna Paraty','Paraty','Barco','Conheça praias e ilhas paradisíacas na Baía de Paraty em um passeio incrível com 5 horas de duração','5 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/ee406657-fc12-4b6d-db87-798f435af800/w=900'),
('lancha-paraty-1','Lancha Compartilhada Paraty','Paraty','Lancha','Conheça a Baía de Paraty com estilo no passeio de lancha compartilhada, a melhor opção para quem quer aproveitar melhor as ilhas e praias com 6 horas de duração','6 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b2550b1d-fb1d-4b30-a0fd-f97e456fdc00/w=900'),

-- ===== BUGGY =====
('buggy-1','Passeio de Buggy em Arraial do Cabo','Arraial do Cabo','Buggy','Visite praias incríveis e explore a natureza de Arraial do Cabo por Dunas e Trilhas em um passeio de Buggy','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/d98f1c0d-7f17-4f80-1ba3-701aed6a5000/w=900'),
('buggy-2','Passeio de Buggy Búzios','Búzios','Buggy','Se você procura aventura, diversão e paisagens incríveis, o passeio de buggy em Búzios é a escolha certa! Você vai explorar trilhas e praias de águas cristalinas em um dos lugares mais bonitos do Brasil.','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a78d4813-0bfc-473c-cedb-768e4c6c3300/w=900'),
('buggy-3','Passeio de Buggy Ponta da Alçara','Arraial do Cabo','Buggy','Conheça um dos locais mais incríveis de Arraial do Cabo: a Ponta da Alçara! Uma experiência única, onde você irá conhecer o famoso "Caminho de Moisés"','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a9a81646-db4a-41d3-5cd5-0be911eb7300/w=900'),

-- ===== QUADRICICLO =====
('quad-1','Passeio de Quadriciclo em Arraial do Cabo','Arraial do Cabo','Quadriciclo','Prepare-se para uma aventura em 4 rodas, comande seu quadriciclo e desbrave Trilhas, Dunas e Praias incríveis em Arraial do Cabo','2 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/dc39a08e-cab1-43d0-12b5-f6edae2dd900/w=900'),

-- ===== JET SKI =====
('jetski-1','Jet ski em Cabo Frio e Arraial do Cabo','Cabo Frio','Jet Ski','Curta um Role de Jet Ski na Ilha do Japão em Cabo Frio, aluguel de 30 minutos, 1 hora ou diária','30 min a 8 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/7f15fe3e-d42f-4d6a-cdd5-3174bca97c00/w=900'),

-- ===== MERGULHO =====
('mergulho-1','Mergulho com Cilindro em Arraial do Cabo','Arraial do Cabo','Mergulho','Curta uma experiência única em nosso mergulho de batismo na Capital do Mergulho','2 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/d75e8759-760f-474e-1082-082a2b6b2100/w=900'),
('mergulho-2','Mergulho com Cilindro Búzios','Búzios','Mergulho','Viva uma nova experiência em nosso mergulho de batismo nas águas cristalinas de João Fernandes em Búzios','2 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/de9c88f9-4f43-4dab-d10a-e2ba639cfd00/w=900'),

-- ===== VOO =====
('voo-1','Paramotor Arraial do Cabo','Arraial do Cabo','Voo','Viva a emoção de voar em uma das regiões mais lindas do Rio de Janeiro','15-30 min',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/8ee833e6-8841-4551-f0e0-6f6767737d00/w=900'),
('voo-2','Paramotor Cabo Frio','Cabo Frio','Voo','Viva a emoção de voar em uma das regiões mais lindas do Rio de Janeiro, sobrevoe a famosa Ilha do Japão nessa experiência única na região dos lagos','15-30 min',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/879b70b4-7d07-4859-fd43-143685dec400/w=900'),
('voo-3','Voo de Asa Delta Pedra da Gávea - RJ','Rio de Janeiro','Voo','Voo livre de asa delta da Pedra da Gávea até a praia de São Conrado','10-15 min',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('voo-4','Voo de Helicóptero no RJ','Rio de Janeiro','Voo','Voo para ver de cima as mais belas praias e pontos turísticos do Rio de Janeiro com retorno pela Floresta da Tijuca','7-30 min',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/cdcd65fc-ecda-4205-0949-03ee17d2ac00/w=900'),

-- ===== TRILHAS – BÚZIOS =====
('trilha-buzios-1','Circuito da Gruta do Amor','Búzios','Trilha','Conheça a gruta do amor em Búzios','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('trilha-buzios-2','Circuito das piscinas naturais','Búzios','Trilha','Desbrave essa trilha incrível em Búzios e descubra piscinas naturais escondidas no meio da natureza!','4 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('trilha-buzios-3','Circuito Geológico (City tour)','Búzios','City Tour','Tour completo pelo circuito geológico de Búzios','4 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('trilha-buzios-4','Mangue de Pedras','Búzios','Trilha','Desbrave o balneário de Búzios e conheça o Mangue de Pedras','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('trilha-buzios-5','Sítio arqueológico Pirâmide das cobras','Búzios','Trilha','Desbrave o sítio arqueológico de Búzios com paisagens deslumbrantes','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),

-- ===== TRILHAS – RIO DE JANEIRO =====
('trilha-rj-1','Floresta da Tijuca','Rio de Janeiro','Trilha','Visite a maior Floresta Urbana do Mundo em uma trilha guiada pelos pontos mais encantadores da Tijuca','4 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('trilha-rj-2','Trilha do Telégrafo','Rio de Janeiro','Trilha','Visite uma das trilhas mais famosas do Rio de Janeiro e registre sua foto na famosa pedra do telégrafo','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),

-- ===== TURISMO RJ =====
('turismo-rj-1','Cristo Redentor','Rio de Janeiro','Turismo','Conheça o Cristo Redentor e outros pontos turísticos do Rio de Janeiro em um dia incrível com a RL Trips!','4 horas',1,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('turismo-rj-2','Pão de Açúcar','Rio de Janeiro','Turismo','Conheça o principal e mais procurado ponto turístico do Rio de Janeiro no passeio de bondinho ao Pão de Açúcar!','3 horas',1,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('turismo-rj-3','Cristo + Aquário','Rio de Janeiro','Turismo','Conheça os principais pontos turísticos do Rio de Janeiro em um dia incrível visitando o Cristo Redentor e o Aquário!','8 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('turismo-rj-4','Day Tour Rio de Janeiro','Rio de Janeiro','Turismo','Conheça os principais pontos turísticos do Rio de Janeiro em um dia incrível com visita ao Cristo Redentor, Pão de Açúcar e outros lugares icônicos do Rio de Janeiro','8 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('turismo-rj-5','Aquário','Rio de Janeiro','Turismo','Conheça o maior aquário da América Latina em um incrível passeio contemplando as espécies mais raras do mundo subaquático','3 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900'),
('turismo-rj-6','Favela Tour RJ','Rio de Janeiro','Turismo Cultural','Visite a comunidade mais famosa do Rio de Janeiro em um passeio guiado pela história das favelas do Rio de Janeiro','4 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('turismo-rj-7','Visita ao Maracanã','Rio de Janeiro','Turismo','Conheça o estádio mais famoso e icônico do Brasil em uma visita guiada explorando cada momento desse patrimônio histórico brasileiro','2 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),

-- ===== EXCURSÕES =====
('excursao-1','Excursão + Passeio de barco Rio de Janeiro X Arraial do Cabo','Arraial do Cabo','Excursão','Conheça as águas mais cristalinas do Rio de Janeiro em um bate e volta saindo do RJ para Arraial do Cabo!','14 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900'),
('excursao-2','Excursão + Passeio de barco Rio de Janeiro X Búzios','Búzios','Excursão','Conheça a cidade mais charmosa da região dos lagos em um bate e volta saindo do RJ para Armação dos Búzios!','14 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('excursao-3','Excursão + Passeio de barco Rio de Janeiro X Ilha Grande','Ilha Grande','Excursão','Conheça as maravilhas do Rio de Janeiro em um bate e volta saindo do RJ para Ilha Grande!','16 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b857b248-a932-41ee-e473-ec50d523b200/w=900'),
('excursao-4','Excursão RJ x Petrópolis - Um dia completo na serra','Petrópolis','Excursão','Conheça os principais pontos turísticos de Petrópolis em um dia incrível com visita ao Museu Imperial (ticket incluso), Casa do Santos Dumont, Palácio de Cristal, Catedral, Palácio de Quitandinha, Fábrica de chocolate e Rua Teresa.','10 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),
('excursao-5','Excursão Região dos lagos x RJ - Um dia completo no Rio de Janeiro','Rio de Janeiro','Excursão','Conheça os principais pontos turísticos da capital em um dia incrível com visita ao Cristo Redentor e outros lugares icônicos do Rio de Janeiro com saída de Búzios, Arraial do Cabo e Cabo Frio!','14 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'),

-- ===== TRANSFERS =====
('transfer-1','Transfer econômico','','Transfer','Transfer individual por pessoa, o translado pode ocorrer de van ou ônibus a depender da demanda para o dia desejado',NULL,0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'),
('transfer-2','Transfer para 4 pessoas','','Transfer','Transfer privado para até 4 pessoas, trajetos dentro da região dos Lagos e Rio de Janeiro',NULL,0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'),
('transfer-3','Transfer para 6 pessoas','','Transfer','Transfer privado para até 6 pessoas, trajetos dentro da região dos Lagos e Rio de Janeiro',NULL,0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'),
('transfer-4','Transfer para 8 pessoas','','Transfer','Transfer privado para até 8 pessoas, trajetos dentro da região dos Lagos e Rio de Janeiro',NULL,0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'),

-- ===== COMBOS =====
('combo-1','Passeio de barco + Buggy em Búzios','Búzios','Combo','Quer curtir o melhor de Búzios em um dia inesquecível? Adquira o combo de passeio de barco + Buggy e conheça todas as praias e mirantes do litoral central da cidade','8 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'),
('combo-2','Passeio de barco + quadriciclo em Arraial do Cabo','Arraial do Cabo','Combo','Quer curtir o melhor de Arraial do Cabo em um dia inesquecível? Adquira o combo de passeio de barco + Quadriciclo e conheça todas as praias de Arraial em um único dia com direito a pôr do sol','8 horas',0,'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900');
