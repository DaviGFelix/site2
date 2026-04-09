// ===== DADOS COMPLETOS DOS PASSEIOS RLTRIPS.COM =====
// Última atualização: Fevereiro 2026
// Total: 60+ passeios organizados por categoria

const passeiosData = {
  
  // ========== PASSEIOS DE BARCO ==========
  passeiosBarco: {
    
    // Arraial do Cabo
    arraialCabo: [
      {
        id: 'barco-arraial-1',
        titulo: 'Passeio de Barco 2 andares com escorrega em Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Barco',
        descricao: 'Visite as principais praias de Arraial do Cabo em um passeio de 4 horas com água gratuita e cortesia de frutas',
        duracao: '4 horas',
        destaque: true,
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900'
      },
      {
        id: 'barco-arraial-2',
        titulo: 'Passeio de Barco Open bar em Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Barco',
        descricao: 'Conheça as principais praias de Arraial do Cabo em um passeio de barco de 4 horas que conta com água, refrigerante e caipirinha inclusos',
        duracao: '4 horas',
        destaque: true,
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/fd36d1b9-e256-44cc-3c40-62096b78d300/w=900'
      },
      {
        id: 'barco-arraial-3',
        titulo: 'Passeio de Barco Premium em Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Barco',
        descricao: 'Aproveite 5 Horas de duração e atendimento diferenciado! A melhor opção para quem quer aproveitar ao máximo sua experiência em Arraial do Cabo!',
        duracao: '5 horas',
        destaque: true,
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/7652c285-cd49-4128-bb3b-dc37371c5700/w=900'
      }
    ],

    // Búzios
    buzios: [
      {
        id: 'barco-buzios-1',
        titulo: 'Catamarã Premium em Búzios',
        destino: 'Búzios',
        categoria: 'Barco',
        descricao: 'Curta 3 horas de passeio nas águas cristalinas de Búzios com DJ Blindado a bordo, pista de dança e muita diversão na melhor vibe de Búzios',
        duracao: '3 horas',
        destaque: true,
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900'
      },
      {
        id: 'barco-buzios-2',
        titulo: 'Passeio de Escuna em Búzios',
        destino: 'Búzios',
        categoria: 'Barco',
        descricao: 'Visite a costa central de Búzios em um passeio de barco com 2:30 de duração visitando 12 praias e 3 Ilhas, incluindo João Fernandes',
        duracao: '2.5 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/76b0fcc5-5b5b-454c-6bd9-012c991fbf00/w=900'
      },
      {
        id: 'barco-buzios-3',
        titulo: 'Passeio de Escuna 2 andares com tobogã em Búzios',
        destino: 'Búzios',
        categoria: 'Barco',
        descricao: 'Conheça 12 praias e 3 Ilhas em um passeio de barco incrível na costa central da Armação de Búzios, barco de 2 andares com tobogã e piscina infantil',
        duracao: '4 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/90d4618d-d2fb-4884-1e5d-5ecc60022500/w=900'
      }
    ],

    // Cabo Frio
    caboFrio: [
      {
        id: 'barco-cabofrio-1',
        titulo: 'Passeio de Catamarã em Cabo Frio',
        destino: 'Cabo Frio',
        categoria: 'Barco',
        descricao: 'Conheça a famosa Ilha do Japão e a Praia do Forte em um passeio de catamarã com duração de 3 horas pelas belas paisagens de Cabo Frio',
        duracao: '3 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/f983a0c1-e19f-4acb-55af-c07319a34800/w=900'
      }
    ],

    // Angra dos Reis
    angraReis: [
      {
        id: 'barco-angra-1',
        titulo: 'Passeio de Escuna Angra dos Reis',
        destino: 'Angra dos Reis',
        categoria: 'Barco',
        descricao: 'Conheça as principais praias e ilhas da região em um passeio de escuna de 5 horas e meia de duração',
        duracao: '5.5 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900'
      }
    ],

    // Ilha Grande
    ilhaGrande: [
      {
        id: 'barco-ilha-1',
        titulo: 'Caipirinha Tour Ilha Grande',
        destino: 'Ilha Grande',
        categoria: 'Barco',
        descricao: 'Conheça o Caipirinha Tour, um passeio para quem quer se divertir e aproveitar as praias mais lindas da Ilha Grande',
        duracao: '6 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b857b248-a932-41ee-e473-ec50d523b200/w=900'
      },
      {
        id: 'lancha-ilha-1',
        titulo: 'Passeio de Lancha Super Lagoa Azul',
        destino: 'Ilha Grande',
        categoria: 'Lancha',
        descricao: 'Conheça a famosa Lagoa Azul em um passeio de 6 horas com descida nas praias e paradas para mergulho!',
        duracao: '6 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/e7b1c185-5b19-4a0f-6c73-9449e9e8bd00/w=900'
      },
      {
        id: 'lancha-ilha-2',
        titulo: 'Passeio de Lancha Ilhas Paradisíacas',
        destino: 'Ilha Grande',
        categoria: 'Lancha',
        descricao: 'Conheça as Ilhas mais lindas da Ilha Grande em um passeio de 6 horas com descida nas praias e paradas para mergulho!',
        duracao: '6 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/10b90790-7cd3-41a3-83ca-2895be6a2e00/w=900'
      },
      {
        id: 'lancha-ilha-3',
        titulo: 'Passeio de Lancha Gruta do Açaí',
        destino: 'Ilha Grande',
        categoria: 'Lancha',
        descricao: 'Conheça a Gruta do Açaí, uma misteriosa caverna na Ilha Grande onde ocorre um fenômeno natural incrível!',
        duracao: '6 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/36c16097-9b3b-423d-495c-c10c60736700/w=900'
      }
    ],

    // Paraty
    paraty: [
      {
        id: 'barco-paraty-1',
        titulo: 'Passeio de Escuna Paraty',
        destino: 'Paraty',
        categoria: 'Barco',
        descricao: 'Conheça praias e ilhas paradisíacas na Baía de Paraty em um passeio incrível com 5 horas de duração',
        duracao: '5 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/ee406657-fc12-4b6d-db87-798f435af800/w=900'
      },
      {
        id: 'lancha-paraty-1',
        titulo: 'Lancha Compartilhada Paraty',
        destino: 'Paraty',
        categoria: 'Lancha',
        descricao: 'Conheça a Baía de Paraty com estilo no passeio de lancha compartilhada, a melhor opção para quem quer aproveitar melhor as ilhas e praias com 6 horas de duração',
        duracao: '6 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b2550b1d-fb1d-4b30-a0fd-f97e456fdc00/w=900'
      }
    ]
  },

  // ========== AVENTURA & RADICAL ==========
  aventuraRadical: {
    
    // Buggy
    buggy: [
      {
        id: 'buggy-1',
        titulo: 'Passeio de Buggy em Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Buggy',
        descricao: 'Visite praias incríveis e explore a natureza de Arraial do Cabo por Dunas e Trilhas em um passeio de Buggy',
        duracao: '3 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/d98f1c0d-7f17-4f80-1ba3-701aed6a5000/w=900'
      },
      {
        id: 'buggy-2',
        titulo: 'Passeio de Buggy Búzios',
        destino: 'Búzios',
        categoria: 'Buggy',
        descricao: 'Se você procura aventura, diversão e paisagens incríveis, o passeio de buggy em Búzios é a escolha certa! Você vai explorar trilhas e praias de águas cristalinas em um dos lugares mais bonitos do Brasil.',
        duracao: '3 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a78d4813-0bfc-473c-cedb-768e4c6c3300/w=900'
      },
      {
        id: 'buggy-3',
        titulo: 'Passeio de Buggy Ponta da Alçara',
        destino: 'Arraial do Cabo',
        categoria: 'Buggy',
        descricao: 'Conheça um dos locais mais incríveis de Arraial do Cabo: a Ponta da Alçara! Uma experiência única, onde você irá conhecer o famoso "Caminho de Moisés"',
        duracao: '3 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a9a81646-db4a-41d3-5cd5-0be911eb7300/w=900'
      }
    ],

    // Quadriciclo
    quadriciclo: [
      {
        id: 'quad-1',
        titulo: 'Passeio de Quadriciclo em Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Quadriciclo',
        descricao: 'Prepare-se para uma aventura em 4 rodas, comande seu quadriciclo e desbrave Trilhas, Dunas e Praias incríveis em Arraial do Cabo',
        duracao: '2 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/dc39a08e-cab1-43d0-12b5-f6edae2dd900/w=900'
      }
    ],

    // Jet Ski
    jetSki: [
      {
        id: 'jetski-1',
        titulo: 'Jet ski em Cabo Frio e Arraial do Cabo',
        destino: 'Cabo Frio',
        categoria: 'Jet Ski',
        descricao: 'Curta um Role de Jet Ski na Ilha do Japão em Cabo Frio, aluguel de 30 minutos, 1 hora ou diária',
        duracao: '30 min a 8 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/7f15fe3e-d42f-4d6a-cdd5-3174bca97c00/w=900'
      }
    ],

    // Mergulho
    mergulho: [
      {
        id: 'mergulho-1',
        titulo: 'Mergulho com Cilindro em Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Mergulho',
        descricao: 'Curta uma experiência única em nosso mergulho de batismo na Capital do Mergulho',
        duracao: '2 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/d75e8759-760f-474e-1082-082a2b6b2100/w=900'
      },
      {
        id: 'mergulho-2',
        titulo: 'Mergulho com Cilindro Búzios',
        destino: 'Búzios',
        categoria: 'Mergulho',
        descricao: 'Viva uma nova experiência em nosso mergulho de batismo nas águas cristalinas de João Fernandes em Búzios',
        duracao: '2 horas',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/de9c88f9-4f43-4dab-d10a-e2ba639cfd00/w=900'
      }
    ],

    // Voos
    voos: [
      {
        id: 'voo-1',
        titulo: 'Paramotor Arraial do Cabo',
        destino: 'Arraial do Cabo',
        categoria: 'Voo',
        descricao: 'Viva a emoção de voar em uma das regiões mais lindas do Rio de Janeiro',
        duracao: '15-30 min',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/8ee833e6-8841-4551-f0e0-6f6767737d00/w=900'
      },
      {
        id: 'voo-2',
        titulo: 'Paramotor Cabo Frio',
        destino: 'Cabo Frio',
        categoria: 'Voo',
        descricao: 'Viva a emoção de voar em uma das regiões mais lindas do Rio de Janeiro, sobrevoe a famosa Ilha do Japão nessa experiência única na região dos lagos',
        duracao: '15-30 min',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/879b70b4-7d07-4859-fd43-143685dec400/w=900'
      },
      {
        id: 'voo-3',
        titulo: 'Voo de Asa Delta Pedra da Gávea - RJ',
        destino: 'Rio de Janeiro',
        categoria: 'Voo',
        descricao: 'Voo livre de asa delta da Pedra da Gávea até a praia de São Conrado',
        duracao: '10-15 min',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900'
      },
      {
        id: 'voo-4',
        titulo: 'Voo de Helicóptero no RJ',
        destino: 'Rio de Janeiro',
        categoria: 'Voo',
        descricao: 'Voo para ver de cima as mais belas praias e pontos turísticos do Rio de Janeiro com retorno pela Floresta da Tijuca',
        duracao: '7-30 min',
        imagemUrl: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/cdcd65fc-ecda-4205-0949-03ee17d2ac00/w=900'
      }
    ]
  },

  // ========== TRILHAS & ECOTURISMO ==========
  trilhas: {
    
    // Búzios
    buzios: [
      {
        id: 'trilha-buzios-1',
        titulo: 'Circuito da Gruta do Amor',
        destino: 'Búzios',
        categoria: 'Trilha',
        descricao: 'Conheça a gruta do amor em Búzios',
        duracao: '3 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
      },
      {
        id: 'trilha-buzios-2',
        titulo: 'Circuito das piscinas naturais',
        destino: 'Búzios',
        categoria: 'Trilha',
        descricao: 'Desbrave essa trilha incrível em Búzios e descubra piscinas naturais escondidas no meio da natureza!',
        duracao: '4 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
      },
      {
        id: 'trilha-buzios-3',
        titulo: 'Circuito Geológico (City tour)',
        destino: 'Búzios',
        categoria: 'City Tour',
        descricao: 'Tour completo pelo circuito geológico de Búzios',
        duracao: '4 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
      },
      {
        id: 'trilha-buzios-4',
        titulo: 'Mangue de Pedras',
        destino: 'Búzios',
        categoria: 'Trilha',
        descricao: 'Desbrave o balneário de Búzios e conheça o Mangue de Pedras',
        duracao: '3 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
      },
      {
        id: 'trilha-buzios-5',
        titulo: 'Sítio arqueológico Pirâmide das cobras',
        destino: 'Búzios',
        categoria: 'Trilha',
        descricao: 'Desbrave o sítio arqueológico de Búzios com paisagens deslumbrantes',
        duracao: '3 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
      }
    ],

    // Rio de Janeiro
    rioJaneiro: [
      {
        id: 'trilha-rj-1',
        titulo: 'Floresta da Tijuca',
        destino: 'Rio de Janeiro',
        categoria: 'Trilha',
        descricao: 'Visite a maior Floresta Urbana do Mundo em uma trilha guiada pelos pontos mais encantadores da Tijuca',
        duracao: '4 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
      },
      {
        id: 'trilha-rj-2',
        titulo: 'Trilha do Telégrafo',
        destino: 'Rio de Janeiro',
        categoria: 'Trilha',
        descricao: 'Visite uma das trilhas mais famosas do Rio de Janeiro e registre sua foto na famosa pedra do telégrafo',
        duracao: '3 horas',
        imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
      }
    ]
  },

  // ========== TURISMO RIO DE JANEIRO ==========
  turismoRJ: [
    {
      id: 'turismo-rj-1',
      titulo: 'Cristo Redentor',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo',
      descricao: 'Conheça o Cristo Redentor e outros pontos turísticos do Rio de Janeiro em um dia incrível com a RL Trips!',
      duracao: '4 horas',
      destaque: true,
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    },
    {
      id: 'turismo-rj-2',
      titulo: 'Pão de Açúcar',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo',
      descricao: 'Conheça o principal e mais procurado ponto turístico do Rio de Janeiro no passeio de bondinho ao Pão de Açúcar!',
      duracao: '3 horas',
      destaque: true,
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    },
    {
      id: 'turismo-rj-3',
      titulo: 'Cristo + Aquário',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo',
      descricao: 'Conheça os principais pontos turísticos do Rio de Janeiro em um dia incrível visitando o Cristo Redentor e o Aquário!',
      duracao: '8 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    },
    {
      id: 'turismo-rj-4',
      titulo: 'Day Tour Rio de Janeiro',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo',
      descricao: 'Conheça os principais pontos turísticos do Rio de Janeiro em um dia incrível com visita ao Cristo Redentor, Pão de Açúcar e outros lugares icônicos do Rio de Janeiro',
      duracao: '8 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    },
    {
      id: 'turismo-rj-5',
      titulo: 'Aquário',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo',
      descricao: 'Conheça o maior aquário da América Latina em um incrível passeio contemplando as espécies mais raras do mundo subaquático',
      duracao: '3 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
    },
    {
      id: 'turismo-rj-6',
      titulo: 'Favela Tour RJ',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo Cultural',
      descricao: 'Visite a comunidade mais famosa do Rio de Janeiro em um passeio guiado pela história das favelas do Rio de Janeiro',
      duracao: '4 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    },
    {
      id: 'turismo-rj-7',
      titulo: 'Visita ao Maracanã',
      destino: 'Rio de Janeiro',
      categoria: 'Turismo',
      descricao: 'Conheça o estádio mais famoso e icônico do Brasil em uma visita guiada explorando cada momento desse patrimônio histórico brasileiro',
      duracao: '2 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    }
  ],

  // ========== EXCURSÕES ==========
  excursoes: [
    {
      id: 'excursao-1',
      titulo: 'Excursão + Passeio de barco Rio de Janeiro X Arraial do Cabo',
      destino: 'Arraial do Cabo',
      categoria: 'Excursão',
      descricao: 'Conheça as águas mais cristalinas do Rio de Janeiro em um bate e volta saindo do RJ para Arraial do Cabo!',
      duracao: '14 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
    },
    {
      id: 'excursao-2',
      titulo: 'Excursão + Passeio de barco Rio de Janeiro X Búzios',
      destino: 'Búzios',
      categoria: 'Excursão',
      descricao: 'Conheça a cidade mais charmosa da região dos lagos em um bate e volta saindo do RJ para Armação dos Búzios!',
      duracao: '14 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
    },
    {
      id: 'excursao-3',
      titulo: 'Excursão + Passeio de barco Rio de Janeiro X Ilha Grande',
      destino: 'Ilha Grande',
      categoria: 'Excursão',
      descricao: 'Conheça as maravilhas do Rio de Janeiro em um bate e volta saindo do RJ para Ilha Grande!',
      duracao: '16 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'
    },
    {
      id: 'excursao-4',
      titulo: 'Excursão RJ x Petrópolis - Um dia completo na serra',
      destino: 'Petrópolis',
      categoria: 'Excursão',
      descricao: 'Conheça os principais pontos turísticos de Petrópolis em um dia incrível com visita ao Museu Imperial (ticket incluso), Casa do Santos Dumont, Palácio de Cristal, Catedral, Palácio de Quitandinha, Fábrica de chocolate e Rua Teresa.',
      duracao: '10 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'
    },
    {
      id: 'excursao-5',
      titulo: 'Excursão Região dos lagos x RJ - Um dia completo no Rio de Janeiro',
      destino: 'Rio de Janeiro',
      categoria: 'Excursão',
      descricao: 'Conheça os principais pontos turísticos da capital em um dia incrível com visita ao Cristo Redentor e outros lugares icônicos do Rio de Janeiro com saída de Búzios, Arraial do Cabo e Cabo Frio!',
      duracao: '14 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
    }
  ],

  // ========== TRANSFERS ==========
  transfers: [
    {
      id: 'transfer-1',
      titulo: 'Transfer econômico',
      categoria: 'Transfer',
      descricao: 'Transfer individual por pessoa, o translado pode ocorrer de van ou ônibus a depender da demanda para o dia desejado',
      imagemUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80'
    },
    {
      id: 'transfer-2',
      titulo: 'Transfer para 4 pessoas',
      categoria: 'Transfer',
      descricao: 'Transfer privado para até 4 pessoas, trajetos dentro da região dos Lagos e Rio de Janeiro',
      imagemUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80'
    },
    {
      id: 'transfer-3',
      titulo: 'Transfer para 6 pessoas',
      categoria: 'Transfer',
      descricao: 'Transfer privado para até 6 pessoas, trajetos dentro da região dos Lagos e Rio de Janeiro',
      imagemUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80'
    },
    {
      id: 'transfer-4',
      titulo: 'Transfer para 8 pessoas',
      categoria: 'Transfer',
      descricao: 'Transfer privado para até 8 pessoas, trajetos dentro da região dos Lagos e Rio de Janeiro',
      imagemUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80'
    }
  ],

  // ========== COMBOS ==========
  combos: [
    {
      id: 'combo-1',
      titulo: 'Passeio de barco + Buggy em Búzios',
      destino: 'Búzios',
      categoria: 'Combo',
      descricao: 'Quer curtir o melhor de Búzios em um dia inesquecível? Adquira o combo de passeio de barco + Buggy e conheça todas as praias e mirantes do litoral central da cidade',
      duracao: '8 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80'
    },
    {
      id: 'combo-2',
      titulo: 'Passeio de barco + quadriciclo em Arraial do Cabo',
      destino: 'Arraial do Cabo',
      categoria: 'Combo',
      descricao: 'Quer curtir o melhor de Arraial do Cabo em um dia inesquecível? Adquira o combo de passeio de barco + Quadriciclo e conheça todas as praias de Arraial em um único dia com direito a pôr do sol',
      duracao: '8 horas',
      imagemUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
    }
  ]
};

// Função helper para obter todos os passeios em um array simples
function getTodosPasseios() {
  const todos = [];
  
  // Passeios de barco
  Object.values(passeiosData.passeiosBarco).forEach(categoria => {
    todos.push(...categoria);
  });
  
  // Aventura radical
  Object.values(passeiosData.aventuraRadical).forEach(categoria => {
    todos.push(...categoria);
  });
  
  // Trilhas
  Object.values(passeiosData.trilhas).forEach(categoria => {
    todos.push(...categoria);
  });
  
  // Turismo RJ, Excursões, Transfers e Combos
  todos.push(...passeiosData.turismoRJ);
  todos.push(...passeiosData.excursoes);
  todos.push(...passeiosData.transfers);
  todos.push(...passeiosData.combos);
  
  return todos;
}

// Função para filtrar por destino
function filtrarPorDestino(destino) {
  return getTodosPasseios().filter(p => p.destino === destino);
}

// Função para filtrar por categoria
function filtrarPorCategoria(categoria) {
  return getTodosPasseios().filter(p => p.categoria === categoria);
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.passeiosData = passeiosData;
  window.getTodosPasseios = getTodosPasseios;
  window.filtrarPorDestino = filtrarPorDestino;
  window.filtrarPorCategoria = filtrarPorCategoria;
}
