// =====================================================
// js/main.js — Simplesmente Arraial do Cabo
// Catálogo de passeios + filtros + modal de reserva
// =====================================================

// ===== ESTADO GLOBAL =====
let todosPasseios = [];
let passeiosFiltrados = [];
let passeioSelecionado = null;

// ===== DOM =====
const header = document.getElementById('header');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const scrollTopBtn = document.getElementById('scroll-top');
const filtroDestino = document.getElementById('filtro-destino');
const filtroTipo = document.getElementById('filtro-tipo');
const passeiosGrid = document.getElementById('passeios-grid');
const passeiosEmpty = document.getElementById('passeios-empty');
const passeiosFeedback = document.getElementById('passeios-feedback');
const modalReserva = document.getElementById('modal-reserva');
const modalSucesso = document.getElementById('modal-sucesso');
const formReserva = document.getElementById('form-reserva');
const inspiraSwiperWrapper = document.getElementById('inspira-swiper-wrapper');
const climaWidget = document.getElementById('clima-widget');

const API_TIMEOUT = 8000;
const PAGE_ASSET_BUSTER = Date.now();

// ===== MÍDIAS GLOBAIS DO SITE =====
const DEFAULT_SITE_MEDIA = {
    asset_version: String(PAGE_ASSET_BUSTER),
    branding: {
        logo_url: 'https://www.genspark.ai/api/files/s/eTJcP2Bb',
        logo_alt: 'Simplesmente Arraial do Cabo'
    },
    hero_slides: [
        {
            image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=1800',
            badge: '⭐ Passeio em Destaque',
            title: 'Descubra Arraial do Cabo',
            description: 'Águas cristalinas e praias paradisíacas te esperam no Caribe Brasileiro',
            primary_text: 'Ver Passeios',
            primary_link: '#passeios',
            secondary_text: 'Saiba Mais',
            secondary_link: 'passeio-detalhes.html?id=barco-arraial-1'
        },
        {
            image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/734e0371-4a94-40f9-0007-8c0a2125c300/w=1800',
            badge: '🎉 Festa no Mar',
            title: 'Búzios com Estilo',
            description: 'Catamarã Premium com DJ ao vivo, diversão e águas cristalinas',
            primary_text: 'Reservar Agora',
            primary_link: 'passeio-detalhes.html?id=barco-buzios-1',
            secondary_text: 'Explorar Mais',
            secondary_link: '#passeios'
        },
        {
            image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/2d79a478-86da-48d2-cbe7-08bd92982400/w=1800',
            badge: '🚌 Excursões Saindo do RJ',
            title: 'Bate e Volta Inesquecível',
            description: 'Conheça os destinos mais lindos em um único dia',
            primary_text: 'Ver Excursões',
            primary_link: '#passeios',
            secondary_text: 'Falar Conosco',
            secondary_link: '#contato'
        },
        {
            image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/50e1be52-6dd7-4fbe-1c33-7e4aab990700/w=1800',
            badge: '🏄 Aventura e Adrenalina',
            title: 'Experiências Radicais',
            description: 'Buggy, Quadriciclo, Mergulho e muito mais!',
            primary_text: 'Quero Aventura!',
            primary_link: '#passeios',
            secondary_text: 'Todos os Passeios',
            secondary_link: '#passeios'
        }
    ],
    destinos: [
        { key: 'Arraial do Cabo', title: 'Arraial do Cabo', text: 'Praias paradisíacas com águas cristalinas', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900' },
        { key: 'Búzios', title: 'Búzios', text: 'Sofisticação e charme mediterrâneo', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/11a6e4fa-5f47-4927-4134-60ab57cd7b00/w=900' },
        { key: 'Cabo Frio', title: 'Cabo Frio', text: 'Dunas de areia branca e sol o ano todo', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/f983a0c1-e19f-4acb-55af-c07319a34800/w=900' },
        { key: 'Angra dos Reis', title: 'Angra dos Reis', text: '365 ilhas de pura beleza natural', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900' },
        { key: 'Ilha Grande', title: 'Ilha Grande', text: 'Natureza intocada e praias selvagens', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/b857b248-a932-41ee-e473-ec50d523b200/w=900' },
        { key: 'Paraty', title: 'Paraty', text: 'História colonial e baías deslumbrantes', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/ee406657-fc12-4b6d-db87-798f435af800/w=900' },
        { key: 'Rio de Janeiro', title: 'Rio de Janeiro', text: 'Cristo Redentor, Pão de Açúcar e muito mais', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/a7307552-6716-4d0c-974b-48bc0325ab00/w=900' },
        { key: 'Petrópolis', title: 'Petrópolis', text: 'A cidade imperial da serra carioca', image_url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/cdcd65fc-ecda-4205-0949-03ee17d2ac00/w=900' }
    ],
    inspira_gallery: [
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c4b4fb96-11f7-459d-bd5a-73b8a593fa00/w=900', title: 'Caminho de areia em Arraial do Cabo', description: 'Visual perfeito para destacar experiências exclusivas e passeios contemplativos.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/fd36d1b9-e256-44cc-3c40-62096b78d300/w=900', title: 'Barco em água cristalina', description: 'Imagem ideal para valorizar passeios de barco e experiências premium.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/7652c285-cd49-4128-bb3b-dc37371c5700/w=900', title: 'Enseada com embarcações', description: 'Mostra movimento, procura alta e clima de verão na região.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/080b6548-7df7-4edf-8a85-cf87e55c5700/w=1800', title: 'Praia preservada vista do alto', description: 'Perfeita para reforçar a beleza natural e o apelo visual do destino.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/60855586-81f2-4f44-f864-55e68ff07e00/w=1800', title: 'Praia com mar verde-esmeralda', description: 'Ótima para comunicar lazer, família e passeio de dia inteiro.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/44ad3533-655c-4ede-95a6-b27d4c7fb000/w=900', title: 'Escuna turística', description: 'Ajuda a contextualizar o tipo de embarcação usado nos roteiros.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/c62221bc-068a-498a-3aa8-6a3561de6c00/w=900', title: 'Acesso à praia por passarela', description: 'Traz sensação de chegada ao paraíso e reforça o aspecto aspiracional.' },
        { url: 'https://imagedelivery.net/EafvxYlk8cSUsWEWsetEdQ/ee406657-fc12-4b6d-db87-798f435af800/w=900', title: 'Praia selvagem com ondas', description: 'Boa para destacar aventura, natureza e experiências fora do óbvio.' }
    ]
};

let siteMedia = JSON.parse(JSON.stringify(DEFAULT_SITE_MEDIA));

// ===== ÍCONES POR CATEGORIA =====
const ICONE_CATEGORIA = {
    'Barco': 'fa-ship',
    'Lancha': 'fa-ship',
    'Buggy': 'fa-car',
    'Quadriciclo': 'fa-motorcycle',
    'Mergulho': 'fa-water',
    'Jet Ski': 'fa-water',
    'Voo': 'fa-plane',
    'Trilha': 'fa-hiking',
    'City Tour': 'fa-map-marked-alt',
    'Turismo': 'fa-landmark',
    'Turismo Cultural': 'fa-university',
    'Excursão': 'fa-bus',
    'Transfer': 'fa-shuttle-van',
    'Combo': 'fa-layer-group'
};

function iconeCategoria(categoria) {
    return ICONE_CATEGORIA[categoria] || 'fa-compass';
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupNavegacao();
    setupScroll();
    setupFiltros();
    setupForm();
    setupDateInput();
    setupPhoneInput();
    await carregarMidiasDoSite();
    aplicarBrandingSite();
    aplicarDestinosDinamicos();
    renderHeroSlides();
    setupHeroCarousel();
    setupGaleriaInspiracao();
    initClimaWidget();
    renderPasseiosSkeleton();
    await carregarPasseios();
}

// ===== NAVEGAÇÃO =====
function setupNavegacao() {
    navToggle?.addEventListener('click', () => navMenu?.classList.add('show-menu'));
    navClose?.addEventListener('click', () => navMenu?.classList.remove('show-menu'));

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu?.classList.remove('show-menu');
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            if (!href || href.length <= 1) return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function setupScroll() {
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scroll-header', window.scrollY >= 50);
        }

        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('show', window.scrollY >= 400);
        }
    });

    scrollTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== CARREGAR MÍDIAS DO SITE =====
async function carregarMidiasDoSite() {
    try {
        const response = await fetch(`api/site-media.php?t=${Date.now()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Falha ao buscar mídias do site: ${response.status}`);
        }

        const payload = await response.json();
        if (payload?.success && payload.data) {
            siteMedia = {
                ...siteMedia,
                ...payload.data
            };
        }
    } catch (error) {
        console.warn('Falha ao carregar mídias globais. Aplicando configuração padrão.', error);
    }
}

function resolverAssetUrl(url, version = siteMedia?.asset_version || PAGE_ASSET_BUSTER) {
    if (!url) return '';

    const value = String(url).trim();
    if (!value) return '';
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;

    const normalized = value.replace(/^\.\//, '').replace(/^\//, '');
    const separator = normalized.includes('?') ? '&' : '?';
    return `${normalized}${separator}v=${encodeURIComponent(version)}`;
}

function aplicarBrandingSite() {
    const logoUrl = resolverAssetUrl(siteMedia?.branding?.logo_url || '');
    if (!logoUrl) return;

    const logoAlt = siteMedia?.branding?.logo_alt || 'Simplesmente Arraial do Cabo';
    document.querySelectorAll('.logo-img, .footer-logo-img').forEach(img => {
        img.src = logoUrl;
        img.alt = logoAlt;
    });
}

function renderHeroSlides() {
    const heroWrapper = document.querySelector('.hero-swiper .swiper-wrapper');
    if (!heroWrapper) return;

    const slides = Array.isArray(siteMedia.hero_slides) && siteMedia.hero_slides.length
        ? siteMedia.hero_slides
        : DEFAULT_SITE_MEDIA.hero_slides;

    heroWrapper.innerHTML = slides.map((slide, index) => `
        <div class="swiper-slide hero-slide">
            <img src="${escHtml(resolverAssetUrl(slide.image_url))}" alt="${escHtml(slide.title || `Slide ${index + 1}`)}" class="hero-slide__bg">
            <div class="hero-slide__overlay"></div>
            <div class="hero-slide__content container">
                <span class="hero-slide__badge">${escHtml(slide.badge || 'Destaque')}</span>
                <h1 class="hero-slide__title">${escHtml(slide.title || '')}</h1>
                <p class="hero-slide__description">${escHtml(slide.description || '')}</p>
                <div class="hero-slide__buttons">
                    ${slide.primary_text ? `<a href="${escHtml(slide.primary_link || '#passeios')}" class="hero-slide__button hero-slide__button--primary"><i class="fas fa-compass"></i> ${escHtml(slide.primary_text)}</a>` : ''}
                    ${slide.secondary_text ? `<a href="${escHtml(slide.secondary_link || '#passeios')}" class="hero-slide__button hero-slide__button--secondary"><i class="fas fa-info-circle"></i> ${escHtml(slide.secondary_text)}</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function aplicarDestinosDinamicos() {
    const destinos = Array.isArray(siteMedia.destinos) && siteMedia.destinos.length
        ? siteMedia.destinos
        : DEFAULT_SITE_MEDIA.destinos;

    destinos.forEach(destino => {
        const card = Array.from(document.querySelectorAll('.destino__card')).find(item => item.dataset.destino === destino.key);
        if (!card) return;

        const image = card.querySelector('.destino__image');
        const title = card.querySelector('.destino__title');
        const text = card.querySelector('.destino__text');

        if (image && destino.image_url) {
            image.src = resolverAssetUrl(destino.image_url);
            image.alt = destino.title || destino.key;
        }
        if (title && destino.title) {
            title.textContent = destino.title;
        }
        if (text && destino.text) {
            text.textContent = destino.text;
        }
    });
}

// ===== CARROSSEL HERO =====
function setupHeroCarousel() {
    if (typeof Swiper === 'undefined') {
        console.warn('Swiper não carregado para o hero carousel.');
        return;
    }

    new Swiper('.hero-swiper', {
        loop: true,
        speed: 900,
        effect: 'fade',
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        fadeEffect: {
            crossFade: true
        },
        pagination: {
            el: '.hero-swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.hero-swiper-button-next',
            prevEl: '.hero-swiper-button-prev'
        },
        keyboard: {
            enabled: true
        }
    });
}

// ===== GALERIA DE IMAGENS =====
function setupGaleriaInspiracao() {
    if (!inspiraSwiperWrapper) return;

    const galeria = Array.isArray(siteMedia.inspira_gallery) && siteMedia.inspira_gallery.length
        ? siteMedia.inspira_gallery
        : DEFAULT_SITE_MEDIA.inspira_gallery;

    inspiraSwiperWrapper.innerHTML = galeria.map((item) => {
        const url = resolverAssetUrl(item.url || item.image_url || '');
        const titulo = item.titulo || item.title || '';
        const descricao = item.descricao || item.description || '';

        return `
        <div class="swiper-slide">
            <article class="inspira-card">
                <div class="inspira-card__image-wrapper">
                    <img src="${url}" alt="${escHtml(titulo)}" class="inspira-card__image" loading="lazy">
                </div>
                <div class="inspira-card__content">
                    <span class="inspira-card__label">Galeria do site</span>
                    <h3 class="inspira-card__title">${escHtml(titulo)}</h3>
                    <p class="inspira-card__description">${escHtml(descricao)}</p>
                </div>
            </article>
        </div>
    `;
    }).join('');

    if (typeof Swiper === 'undefined') {
        console.warn('Swiper não carregado para a galeria de inspiração.');
        return;
    }

    new Swiper('.inspira-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: galeria.length > 2,
        autoplay: {
            delay: 4200,
            disableOnInteraction: false
        },
        pagination: {
            el: '.inspira-swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.inspira-swiper-button-next',
            prevEl: '.inspira-swiper-button-prev'
        },
        breakpoints: {
            640: {
                slidesPerView: 1.2,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 24
            },
            1024: {
                slidesPerView: 2.6,
                spaceBetween: 28
            }
        }
    });
}

// ===== CLIMA EM TEMPO REAL =====
async function initClimaWidget() {
    if (!climaWidget) return;

    await carregarClima();
    window.setInterval(carregarClima, 10 * 60 * 1000);
}

async function carregarClima() {
    if (!climaWidget) return;

    const latitude = climaWidget.dataset.lat || '-22.96583';
    const longitude = climaWidget.dataset.lon || '-42.02778';
    const timezone = climaWidget.dataset.timezone || 'America/Sao_Paulo';
    const diasPrevisao = 5;

    climaWidget.innerHTML = `
        <div class="clima__loading">
            <i class="fas fa-cloud-sun"></i>
            <p>Atualizando clima, vento e mar de Arraial do Cabo...</p>
        </div>
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const endpointClima = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=${encodeURIComponent(timezone)}&forecast_days=${diasPrevisao}`;
        const endpointMar = `https://marine-api.open-meteo.com/v1/marine?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=wave_height,wave_direction,wave_period,sea_surface_temperature&daily=wave_height_max,wave_period_max,sea_surface_temperature_max&timezone=${encodeURIComponent(timezone)}&forecast_days=${diasPrevisao}`;

        const [respostaClima, respostaMar] = await Promise.all([
            fetch(endpointClima, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: controller.signal
            }),
            fetch(endpointMar, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: controller.signal
            })
        ]);

        if (!respostaClima.ok) {
            throw new Error(`Falha ao buscar clima: ${respostaClima.status}`);
        }

        if (!respostaMar.ok) {
            throw new Error(`Falha ao buscar dados do mar: ${respostaMar.status}`);
        }

        const [dadosClima, dadosMar] = await Promise.all([
            respostaClima.json(),
            respostaMar.json()
        ]);

        renderizarClima(dadosClima, dadosMar);
    } catch (error) {
        console.warn('Não foi possível carregar o clima em tempo real.', error);
        climaWidget.innerHTML = `
            <div class="clima__erro">
                <i class="fas fa-cloud-rain"></i>
                <p>Não foi possível atualizar o widget agora. O restante do site continua funcionando normalmente.</p>
                <button class="button" type="button" onclick="carregarClima()">
                    <i class="fas fa-rotate-right"></i> Tentar novamente
                </button>
            </div>
        `;
    } finally {
        clearTimeout(timeoutId);
    }
}

function renderizarClima(dadosClima, dadosMar) {
    if (!climaWidget || !dadosClima?.current) return;

    const current = dadosClima.current || {};
    const daily = dadosClima.daily || {};
    const marAtual = dadosMar?.current || {};
    const marDiario = dadosMar?.daily || {};
    const weather = obterDescricaoClima(current.weather_code, current.is_day);

    const temperatura = formatarNumero(current.temperature_2m, 1);
    const sensacao = formatarNumero(current.apparent_temperature, 1);
    const vento = Number(current.wind_speed_10m) || 0;
    const ventoLabel = formatarNumero(vento, 1);
    const direcaoVento = formatarDirecao(current.wind_direction_10m);
    const umidade = formatarNumero(current.relative_humidity_2m, 0);
    const alturaOnda = Number(marAtual.wave_height);
    const periodoOnda = marAtual.wave_period;
    const temperaturaMar = marAtual.sea_surface_temperature;
    const atualizadoEm = formatarDataHora(current.time);
    const recomendacao = obterRecomendacaoMaritima({
        vento,
        alturaOnda,
        weatherCode: current.weather_code
    });

    const previsao = construirPrevisaoDias(daily, marDiario).map((dia) => {
        const iconeDia = obterDescricaoClima(dia.weatherCode, 1);
        return `
            <article class="clima__forecast-card">
                <div class="clima__forecast-day">${escHtml(dia.label)}</div>
                <div class="clima__forecast-icon"><i class="fas ${iconeDia.icon}"></i></div>
                <div class="clima__forecast-temp">${escHtml(dia.max)}° / ${escHtml(dia.min)}°</div>
                <div class="clima__forecast-meta">
                    <div>${escHtml(iconeDia.label)}</div>
                    <div><i class="fas fa-wind"></i> ${escHtml(dia.vento)} km/h</div>
                    <div><i class="fas fa-water"></i> ${escHtml(dia.onda)} m</div>
                </div>
            </article>
        `;
    }).join('');

    climaWidget.innerHTML = `
        <div class="clima__hero-shell">
            <div class="clima__hero-summary">
                <div class="clima__hero-primary">
                    <div class="clima__hero-location">
                        <span class="clima__eyebrow"><i class="fas fa-satellite-dish"></i> Atualização automática a cada 10 min</span>
                        <div class="clima__city">Arraial do Cabo, RJ</div>
                        <div class="clima__update">Agora às ${atualizadoEm} • ${weather.label}</div>
                    </div>

                    <div class="clima__hero-current">
                        <div class="clima__icon" aria-hidden="true">
                            <i class="fas ${weather.icon}"></i>
                        </div>
                        <div class="clima__temperature">
                            <div class="clima__temperature-value">${temperatura}°C</div>
                            <div class="clima__summary">
                                <strong>Sensação de ${sensacao}°C</strong><br>
                                Resumo rápido para validar o melhor momento do passeio.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="clima__quick-stats">
                    <div class="clima__mini-card">
                        <div class="clima__mini-label"><i class="fas fa-wind"></i> Vento</div>
                        <div class="clima__mini-value">${ventoLabel} km/h</div>
                        <div class="clima__mini-help">Direção ${direcaoVento}</div>
                    </div>
                    <div class="clima__mini-card">
                        <div class="clima__mini-label"><i class="fas fa-droplet"></i> Umidade</div>
                        <div class="clima__mini-value">${umidade}%</div>
                        <div class="clima__mini-help">Conforto térmico</div>
                    </div>
                    <div class="clima__mini-card">
                        <div class="clima__mini-label"><i class="fas fa-water"></i> Altura da onda</div>
                        <div class="clima__mini-value">${formatarNumero(alturaOnda, 1)} m</div>
                        <div class="clima__mini-help">Mar ${classificarMar(alturaOnda)}</div>
                    </div>
                    <div class="clima__mini-card">
                        <div class="clima__mini-label"><i class="fas fa-temperature-half"></i> Temp. do mar</div>
                        <div class="clima__mini-value">${formatarNumero(temperaturaMar, 1)}°C</div>
                        <div class="clima__mini-help">${descreverTemperaturaMar(temperaturaMar)}</div>
                    </div>
                </div>
            </div>

            <div class="clima__hero-bottom">
                <div class="clima__forecast">
                    ${previsao}
                </div>

                <div class="clima__hero-actions">
                    <div class="clima__confidence clima__confidence--${recomendacao.classe}">
                        <i class="fas ${recomendacao.icon}"></i> ${recomendacao.selo}
                    </div>
                    <button class="clima__details-toggle" type="button" aria-expanded="false" aria-controls="clima-details">
                        <i class="fas fa-water"></i> Ver detalhes do mar
                    </button>
                </div>
            </div>

            <div class="clima__details" id="clima-details" hidden>
                <div class="clima__content clima__content--details">
                    <div class="clima__panel clima__panel--details">
                        <div class="clima__advice">
                            <div class="clima__advice-card">
                                <div class="clima__advice-title"><i class="fas fa-ship"></i> Passeios de barco</div>
                                <div class="clima__advice-text">${recomendacao.barco}</div>
                            </div>
                            <div class="clima__advice-card">
                                <div class="clima__advice-title"><i class="fas fa-person-swimming"></i> Mergulho e snorkel</div>
                                <div class="clima__advice-text">${recomendacao.mergulho}</div>
                            </div>
                        </div>
                    </div>

                    <div class="clima__panel clima__panel--details clima__panel--meta">
                        <div class="clima__sea-grid">
                            <div class="clima__mini-card">
                                <div class="clima__mini-label"><i class="fas fa-wave-square"></i> Período da onda</div>
                                <div class="clima__mini-value">${formatarNumero(periodoOnda, 1)} s</div>
                                <div class="clima__mini-help">Ondulação média do momento</div>
                            </div>
                            <div class="clima__mini-card">
                                <div class="clima__mini-label"><i class="fas fa-compass"></i> Leitura do mar</div>
                                <div class="clima__mini-value">${classificarMar(alturaOnda)}</div>
                                <div class="clima__mini-help">Baseado em vento e ondas</div>
                            </div>
                        </div>

                        <div class="clima__note">
                            <div class="clima__note-title"><i class="fas fa-circle-info"></i> Leitura rápida</div>
                            <p>Sensação de ${sensacao}°C, vento em ${ventoLabel} km/h e mar ${classificarMar(alturaOnda)} no momento.</p>
                        </div>
                    </div>
                </div>

                <div class="clima__footer">
                    <div class="clima__footer-meta">
                        <span><i class="fas fa-location-dot"></i> Coordenadas de Arraial do Cabo</span>
                        <span><i class="fas fa-calendar-days"></i> Previsão estendida para 5 dias</span>
                    </div>
                    <p class="clima__source">Fontes: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> e <a href="https://marine-api.open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo Marine</a></p>
                </div>
            </div>
        </div>
    `;

    const detailsToggle = climaWidget.querySelector('.clima__details-toggle');
    const detailsPanel = climaWidget.querySelector('#clima-details');

    detailsToggle?.addEventListener('click', () => {
        const expanded = detailsToggle.getAttribute('aria-expanded') === 'true';
        detailsToggle.setAttribute('aria-expanded', String(!expanded));
        detailsPanel.hidden = expanded;
        detailsToggle.innerHTML = expanded
            ? '<i class="fas fa-water"></i> Ver detalhes do mar'
            : '<i class="fas fa-eye-slash"></i> Ocultar detalhes';
    });
}

function construirPrevisaoDias(daily, marDiario) {
    const datas = Array.isArray(daily.time) ? daily.time : [];
    return datas.slice(0, 5).map((data, index) => ({
        label: formatarDiaSemana(data, index),
        weatherCode: Array.isArray(daily.weather_code) ? daily.weather_code[index] : 0,
        max: formatarNumero(Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[index] : null, 0),
        min: formatarNumero(Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[index] : null, 0),
        vento: formatarNumero(Array.isArray(daily.wind_speed_10m_max) ? daily.wind_speed_10m_max[index] : null, 0),
        onda: formatarNumero(Array.isArray(marDiario.wave_height_max) ? marDiario.wave_height_max[index] : null, 1)
    }));
}

function obterRecomendacaoMaritima({ vento = 0, alturaOnda = 0, weatherCode = 0 }) {
    const chuvaForte = [63, 65, 80, 81, 82, 95, 96, 99].includes(Number(weatherCode));

    if (chuvaForte || vento >= 28 || alturaOnda >= 1.6) {
        return {
            selo: 'Atenção para operações no mar',
            classe: 'alert',
            icon: 'fa-circle-exclamation',
            barco: 'Condição mais sensível para passeios de barco. Vale confirmar saídas, rotas e possíveis ajustes com a equipe antes da reserva.',
            mergulho: 'Mar com maior chance de mexida e visibilidade reduzida. Indicado validar com o operador se o mergulho será mantido ou remarcado.'
        };
    }

    if (vento >= 20 || alturaOnda >= 1.0) {
        return {
            selo: 'Condição boa, com atenção',
            classe: 'medium',
            icon: 'fa-circle-half-stroke',
            barco: 'Passeios de barco tendem a operar normalmente, mas o mar pode oscilar ao longo do dia. Bom destacar possibilidade de rota adaptada.',
            mergulho: 'Para snorkel e mergulho, o cenário é intermediário. Melhor janela costuma ser no início do dia, com confirmação do operador.'
        };
    }

    return {
        selo: 'Janela favorável para mar calmo',
        classe: 'good',
        icon: 'fa-circle-check',
        barco: 'Cenário favorável para passeios de barco, com vento e ondulação mais tranquilos para uma experiência mais confortável.',
        mergulho: 'Condição promissora para mergulho e snorkel, com maior chance de boa estabilidade e melhor experiência na água.'
    };
}

function classificarMar(alturaOnda) {
    const valor = Number(alturaOnda);
    if (!Number.isFinite(valor)) return 'indisponível';
    if (valor < 0.7) return 'mais calmo';
    if (valor < 1.2) return 'moderado';
    return 'agitado';
}

function descreverTemperaturaMar(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return 'Temperatura indisponível';
    if (numero >= 25) return 'Água mais convidativa';
    if (numero >= 22) return 'Boa para banho';
    return 'Água mais fria';
}

function formatarDirecao(graus) {
    const valor = Number(graus);
    if (!Number.isFinite(valor)) return '--';
    const direcoes = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const indice = Math.round(valor / 45) % 8;
    return direcoes[indice];
}

function formatarDiaSemana(valor, index = 0) {
    if (!valor) return `Dia ${index + 1}`;
    const data = new Date(`${valor}T12:00:00`);
    if (Number.isNaN(data.getTime())) return `Dia ${index + 1}`;

    if (index === 0) return 'Hoje';

    return data.toLocaleDateString('pt-BR', {
        weekday: 'short'
    }).replace('.', '');
}

function obterDescricaoClima(codigo, isDay = 1) {
    const mapa = {
        0: { label: isDay ? 'Céu limpo' : 'Noite limpa', icon: isDay ? 'fa-sun' : 'fa-moon' },
        1: { label: 'Predomínio de sol', icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon' },
        2: { label: 'Parcialmente nublado', icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon' },
        3: { label: 'Nublado', icon: 'fa-cloud' },
        45: { label: 'Neblina', icon: 'fa-smog' },
        48: { label: 'Neblina com geada', icon: 'fa-smog' },
        51: { label: 'Garoa fraca', icon: 'fa-cloud-rain' },
        53: { label: 'Garoa moderada', icon: 'fa-cloud-rain' },
        55: { label: 'Garoa intensa', icon: 'fa-cloud-rain' },
        56: { label: 'Garoa congelante fraca', icon: 'fa-cloud-rain' },
        57: { label: 'Garoa congelante intensa', icon: 'fa-cloud-rain' },
        61: { label: 'Chuva fraca', icon: 'fa-cloud-showers-heavy' },
        63: { label: 'Chuva moderada', icon: 'fa-cloud-showers-heavy' },
        65: { label: 'Chuva forte', icon: 'fa-cloud-showers-heavy' },
        66: { label: 'Chuva congelante fraca', icon: 'fa-cloud-rain' },
        67: { label: 'Chuva congelante forte', icon: 'fa-cloud-rain' },
        71: { label: 'Neve fraca', icon: 'fa-snowflake' },
        73: { label: 'Neve moderada', icon: 'fa-snowflake' },
        75: { label: 'Neve forte', icon: 'fa-snowflake' },
        77: { label: 'Grãos de neve', icon: 'fa-snowflake' },
        80: { label: 'Pancadas de chuva fracas', icon: 'fa-cloud-sun-rain' },
        81: { label: 'Pancadas de chuva moderadas', icon: 'fa-cloud-sun-rain' },
        82: { label: 'Pancadas de chuva fortes', icon: 'fa-cloud-showers-heavy' },
        85: { label: 'Pancadas de neve fracas', icon: 'fa-snowflake' },
        86: { label: 'Pancadas de neve fortes', icon: 'fa-snowflake' },
        95: { label: 'Trovoadas', icon: 'fa-bolt' },
        96: { label: 'Trovoadas com granizo fraco', icon: 'fa-cloud-bolt' },
        99: { label: 'Trovoadas com granizo forte', icon: 'fa-cloud-bolt' }
    };

    return mapa[codigo] || { label: 'Condição indisponível', icon: 'fa-cloud' };
}

function formatarNumero(valor, casas = 0) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return '--';
    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function formatarHora(valor) {
    if (!valor) return '--:--';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return '--:--';
    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatarDataHora(valor) {
    if (!valor) return '--';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return '--';
    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===== CARREGAMENTO DOS PASSEIOS =====
async function carregarPasseios() {
    limparFeedbackPasseios();

    const fallbackDisponivel = typeof window.getTodosPasseios === 'function';

    if (fallbackDisponivel) {
        todosPasseios = window.getTodosPasseios().map(normalizarPasseio).filter(p => p.id && p.titulo);
        passeiosFiltrados = [...todosPasseios];
        renderizarPasseios(passeiosFiltrados);
    } else {
        renderPasseiosSkeleton();
    }

    try {
        const dadosApi = await buscarPasseiosViaApi();
        const passeiosApi = dadosApi.map(normalizarPasseio).filter(p => p.id && p.titulo);

        if (!passeiosApi.length) {
            throw new Error('A API retornou uma lista vazia.');
        }

        todosPasseios = passeiosApi;
        passeiosFiltrados = [...todosPasseios];
        renderizarPasseios(passeiosFiltrados);
        limparFeedbackPasseios();
    } catch (erroApi) {
        console.error('Falha ao carregar passeios via API:', erroApi);

        if (fallbackDisponivel && todosPasseios.length) {
            mostrarFeedbackPasseios('A API está indisponível no momento. O site carregou o catálogo local para que os passeios continuem aparecendo normalmente.', 'warning');
            return;
        }

        mostrarErroPasseios('Erro ao carregar passeios. Tente novamente em instantes.');
    }
}

async function buscarPasseiosViaApi() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch('api/passeios.php', {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Resposta HTTP inválida: ${response.status}`);
        }

        const payload = await response.json();

        if (!payload?.success || !Array.isArray(payload.data)) {
            throw new Error(payload?.message || 'Formato de resposta inválido.');
        }

        return payload.data;
    } finally {
        clearTimeout(timeoutId);
    }
}

function normalizarPasseio(passeio) {
    const precoLabel = passeio.precoLabel || passeio.preco_label || passeio.valor || '';
    const horarios = Array.isArray(passeio.horarios) ? passeio.horarios.filter(Boolean) : ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00'];
    const idiomas = Array.isArray(passeio.idiomas) ? passeio.idiomas.filter(Boolean) : ['Português', 'Inglês'];
    const destaques = Array.isArray(passeio.destaques) ? passeio.destaques.filter(Boolean) : ['Guia Experiente', 'Seguro Incluído', 'Equipamentos Fornecidos', 'Cancelamento Flexível'];
    const garantias = Array.isArray(passeio.garantias) ? passeio.garantias.filter(Boolean) : ['Reserva segura', 'Cancelamento grátis'];
    const minPessoas = Math.max(1, parseInt(passeio.min_pessoas ?? passeio.minPessoas ?? 1, 10) || 1);
    const maxPessoas = Math.max(minPessoas, parseInt(passeio.max_pessoas ?? passeio.maxPessoas ?? 50, 10) || 50);
    const permitirACombinar = !(passeio.permitir_a_combinar === false || passeio.permitir_a_combinar === 0 || passeio.permitir_a_combinar === '0');

    return {
        ...passeio,
        id: passeio.id || '',
        titulo: passeio.titulo || 'Passeio sem título',
        destino: passeio.destino || '',
        categoria: passeio.categoria || 'Passeio',
        descricao: passeio.descricao || '',
        duracao: passeio.duracao || '',
        destaque: Boolean(passeio.destaque),
        imagemUrl: resolverAssetUrl(passeio.imagemUrl || passeio.imagem_url || ''),
        precoLabel,
        precoValor: passeio.precoValor || passeio.preco_valor || null,
        galeria: Array.isArray(passeio.galeria) ? passeio.galeria.map(item => resolverAssetUrl(item)) : [],
        horarios,
        idiomas,
        gruposLabel: passeio.gruposLabel || passeio.grupos_label || 'Aceita grupos',
        destaques,
        garantias,
        minPessoas,
        maxPessoas,
        permitirACombinar
    };
}

function popularHorariosReserva(passeio) {
    const selectHorario = document.getElementById('horario');
    if (!selectHorario) return;
    const horarios = Array.isArray(passeio?.horarios) ? passeio.horarios.filter(Boolean) : [];
    const opcoes = ['<option value="">Selecione o horário</option>'];
    horarios.forEach((horario) => opcoes.push(`<option value="${escHtml(horario)}">${escHtml(horario)}</option>`));
    if (passeio?.permitirACombinar) opcoes.push('<option value="A combinar">A combinar</option>');
    selectHorario.innerHTML = opcoes.join('');
}

function aplicarConfiguracoesReserva(passeio) {
    popularHorariosReserva(passeio);
    const pessoasInput = document.getElementById('pessoas');
    if (pessoasInput) {
        pessoasInput.min = passeio?.minPessoas || 1;
        pessoasInput.max = passeio?.maxPessoas || 50;
        pessoasInput.value = String(passeio?.minPessoas || 1);
    }
}

// ===== LOADING / ERRO =====
function renderPasseiosSkeleton(quantidade = 6) {
    if (!passeiosGrid) return;

    passeiosGrid.style.display = 'grid';
    if (passeiosEmpty) passeiosEmpty.style.display = 'none';

    passeiosGrid.innerHTML = Array.from({ length: quantidade }).map(() => `
        <article class="passeio__card passeio__card--skeleton" aria-hidden="true">
            <div class="skeleton skeleton--image"></div>
            <div class="passeio__content">
                <div class="skeleton skeleton--badge"></div>
                <div class="skeleton skeleton--title"></div>
                <div class="skeleton skeleton--text"></div>
                <div class="skeleton skeleton--text skeleton--text-short"></div>
                <div class="skeleton skeleton--footer"></div>
            </div>
        </article>
    `).join('');
}

function mostrarErroPasseios(mensagem) {
    if (!passeiosGrid) return;

    passeiosGrid.style.display = 'grid';
    if (passeiosEmpty) passeiosEmpty.style.display = 'none';

    passeiosGrid.innerHTML = `
        <div class="loading loading--error">
            <i class="fas fa-circle-exclamation"></i>
            <p>${escHtml(mensagem)}</p>
            <button class="button button--retry" onclick="carregarPasseios()">
                <i class="fas fa-rotate-right"></i> Tentar novamente
            </button>
        </div>
    `;

    mostrarFeedbackPasseios(mensagem, 'error');
}

function mostrarFeedbackPasseios(mensagem, tipo = 'warning') {
    if (!passeiosFeedback) return;

    passeiosFeedback.innerHTML = `
        <div class="feedback feedback--${tipo}">
            <i class="fas ${tipo === 'error' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}"></i>
            <span>${escHtml(mensagem)}</span>
        </div>
    `;
}

function limparFeedbackPasseios() {
    if (passeiosFeedback) {
        passeiosFeedback.innerHTML = '';
    }
}

// ===== RENDER DOS PASSEIOS =====
function renderizarPasseios(lista) {
    if (!passeiosGrid) return;

    if (!lista || lista.length === 0) {
        passeiosGrid.innerHTML = '';
        passeiosGrid.style.display = 'none';
        if (passeiosEmpty) passeiosEmpty.style.display = 'block';
        return;
    }

    passeiosGrid.style.display = 'grid';
    if (passeiosEmpty) passeiosEmpty.style.display = 'none';

    passeiosGrid.innerHTML = lista.map((passeio, index) => {
        const imagem = passeio.imagemUrl || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80';
        const badgeClass = passeio.destaque ? 'passeio__badge--destaque' : '';

        return `
            <article class="passeio__card ${passeio.destaque ? 'passeio__card--destaque' : ''}" style="animation-delay: ${(index % 9) * 0.07}s" data-id="${escHtml(passeio.id)}">
                <div class="passeio__image-wrapper">
                    <img
                        src="${escHtml(imagem)}"
                        alt="${escHtml(passeio.titulo)}"
                        class="passeio__image"
                        loading="lazy"
                        onerror="this.src='https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'"
                    >
                    <span class="passeio__badge ${badgeClass}">
                        <i class="fas ${iconeCategoria(passeio.categoria)}"></i> ${escHtml(passeio.categoria)}
                    </span>
                    ${passeio.destaque ? '<span class="passeio__tag-destaque"><i class="fas fa-star"></i> Destaque</span>' : ''}
                </div>

                <div class="passeio__content">
                    <div class="passeio__header">
                        <h3 class="passeio__title">${escHtml(passeio.titulo)}</h3>
                        ${passeio.destino ? `<div class="passeio__location"><i class="fas fa-map-marker-alt"></i><span>${escHtml(passeio.destino)}</span></div>` : ''}
                    </div>

                    <p class="passeio__description">${escHtml(passeio.descricao)}</p>

                    <div class="passeio__info">
                        ${passeio.duracao ? `<div class="passeio__info-item"><i class="fas fa-clock"></i><span>${escHtml(passeio.duracao)}</span></div>` : ''}
                        <div class="passeio__info-item"><i class="fas fa-tag"></i><span>${escHtml(passeio.categoria)}</span></div>
                    </div>

                    <div class="passeio__footer">
                        <div class="passeio__price">
                            <span class="passeio__price-label">Valor</span>
                            <span class="passeio__price-value">${escHtml(passeio.precoLabel || 'Consulte-nos')}</span>
                        </div>

                        <div class="passeio__actions">
                            <button class="passeio__button passeio__button--detalhes" onclick="verDetalhes('${escHtml(passeio.id)}')" title="Ver detalhes do passeio">
                                <i class="fas fa-info-circle"></i> Ver Mais
                            </button>
                            <button class="passeio__button" onclick="abrirModalReserva('${escHtml(passeio.id)}')">
                                <i class="fas fa-calendar-check"></i> Reservar
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    passeiosGrid.querySelectorAll('.passeio__card').forEach(card => {
        card.style.animationPlayState = 'paused';
        cardObserver.observe(card);
    });
}

// ===== FILTROS =====
function setupFiltros() {
    filtroDestino?.addEventListener('change', aplicarFiltros);
    filtroTipo?.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const destinoSelecionado = filtroDestino?.value.toLowerCase().trim() || '';
    const tipoSelecionado = filtroTipo?.value.toLowerCase().trim() || '';

    passeiosFiltrados = todosPasseios.filter(passeio => {
        const matchDestino = !destinoSelecionado || (passeio.destino || '').toLowerCase() === destinoSelecionado;
        const matchTipo = !tipoSelecionado || (passeio.categoria || '').toLowerCase() === tipoSelecionado;
        return matchDestino && matchTipo;
    });

    renderizarPasseios(passeiosFiltrados);
    document.getElementById('passeios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filtrarPorDestino(destino) {
    if (filtroDestino) filtroDestino.value = destino;
    if (filtroTipo) filtroTipo.value = '';
    aplicarFiltros();
}

function filtrarPorTipo(tipo) {
    if (filtroTipo) filtroTipo.value = tipo;
    if (filtroDestino) filtroDestino.value = '';
    aplicarFiltros();
}

function limparFiltros() {
    if (filtroDestino) filtroDestino.value = '';
    if (filtroTipo) filtroTipo.value = '';
    passeiosFiltrados = [...todosPasseios];
    renderizarPasseios(passeiosFiltrados);
}

function verDetalhes(passeioId) {
    window.location.href = `passeio-detalhes.html?id=${passeioId}`;
}

// ===== MODAL DE RESERVA =====
function abrirModalReserva(passeioId) {
    passeioSelecionado = todosPasseios.find(passeio => passeio.id === passeioId);

    if (!passeioSelecionado) {
        alert('Passeio não encontrado.');
        return;
    }

    const tituloModal = document.getElementById('modal-passeio-titulo');
    if (tituloModal) {
        tituloModal.textContent = passeioSelecionado.titulo;
    }

    formReserva?.reset();
    setupDateInput();
    aplicarConfiguracoesReserva(passeioSelecionado);
    atualizarResumo();

    modalReserva?.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    modalReserva?.classList.remove('show');
    document.body.style.overflow = '';
    passeioSelecionado = null;
}

function fecharModalSucesso() {
    modalSucesso?.classList.remove('show');
    document.body.style.overflow = '';
}

// ===== FORMULÁRIO =====
function setupForm() {
    formReserva?.addEventListener('submit', handleReservaSubmit);

    ['nome', 'data', 'horario', 'pessoas'].forEach(id => {
        const elemento = document.getElementById(id);
        elemento?.addEventListener('change', atualizarResumo);
        elemento?.addEventListener('input', atualizarResumo);
    });
}

function setupDateInput() {
    const campoData = document.getElementById('data');
    if (campoData) {
        campoData.min = new Date().toISOString().split('T')[0];
    }
}

function setupPhoneInput() {
    const telefoneInput = document.getElementById('telefone');
    telefoneInput?.addEventListener('input', event => {
        let valor = event.target.value.replace(/\D/g, '');
        if (valor.length <= 10) {
            valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        event.target.value = valor;
    });
}

function atualizarResumo() {
    if (!passeioSelecionado) return;

    const data = document.getElementById('data')?.value || '';
    const horario = document.getElementById('horario')?.value || '';
    const pessoas = parseInt(document.getElementById('pessoas')?.value, 10) || 0;

    const resumoPasseio = document.getElementById('resumo-passeio');
    const resumoDestino = document.getElementById('resumo-destino');
    const resumoDuracao = document.getElementById('resumo-duracao');
    const resumoData = document.getElementById('resumo-data');
    const resumoHorario = document.getElementById('resumo-horario');
    const resumoPessoas = document.getElementById('resumo-pessoas');

    if (resumoPasseio) resumoPasseio.textContent = passeioSelecionado.titulo;
    if (resumoDestino) resumoDestino.textContent = passeioSelecionado.destino || '-';
    if (resumoDuracao) resumoDuracao.textContent = passeioSelecionado.duracao || '-';
    if (resumoData) resumoData.textContent = data ? formatarData(data) : '-';
    if (resumoHorario) resumoHorario.textContent = horario || '-';
    if (resumoPessoas) resumoPessoas.textContent = pessoas || '-';
}

async function handleReservaSubmit(event) {
    event.preventDefault();

    if (!passeioSelecionado) {
        alert('Nenhum passeio selecionado.');
        return;
    }

    const nome = document.getElementById('nome')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const telefone = document.getElementById('telefone')?.value.trim() || '';
    const data = document.getElementById('data')?.value || '';
    const horario = document.getElementById('horario')?.value || '';
    const pessoas = parseInt(document.getElementById('pessoas')?.value, 10);
    const observacoes = document.getElementById('observacoes')?.value.trim() || '';

    if (!nome || !email || !telefone || !data || !horario || !pessoas) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    const minPessoas = passeioSelecionado.minPessoas || 1;
    const maxPessoas = passeioSelecionado.maxPessoas || 50;
    if (pessoas < minPessoas || pessoas > maxPessoas) {
        alert(`A quantidade de pessoas permitida para este passeio é de ${minPessoas} a ${maxPessoas}.`);
        return;
    }

    const btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) {
        btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btnConfirmar.disabled = true;
    }

    const payload = {
        passeio_id: passeioSelecionado.id,
        passeio_titulo: passeioSelecionado.titulo,
        nome_cliente: nome,
        email_cliente: email,
        telefone_cliente: telefone,
        data_passeio: data,
        horario_passeio: horario,
        quantidade_pessoas: pessoas,
        observacoes
    };

    try {
        const response = await fetch('api/reservas.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const json = await response.json();

        if (!response.ok || !json?.success) {
            throw new Error(json?.message || 'Não foi possível registrar a reserva.');
        }

        fecharModal();

        const waLink = json.whatsapp || buildWhatsAppLink(payload);
        const btnWhatsapp = document.getElementById('btn-whatsapp-sucesso');
        if (btnWhatsapp) {
            btnWhatsapp.href = waLink;
        }

        modalSucesso?.classList.add('show');
        document.body.style.overflow = 'hidden';
    } catch (erro) {
        console.warn('Falha ao registrar reserva via API. Abrindo fallback do WhatsApp.', erro);
        const waLink = buildWhatsAppLink(payload);
        const btnWhatsapp = document.getElementById('btn-whatsapp-sucesso');
        if (btnWhatsapp) {
            btnWhatsapp.href = waLink;
        }

        fecharModal();
        modalSucesso?.classList.add('show');
        document.body.style.overflow = 'hidden';
    } finally {
        if (btnConfirmar) {
            btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Confirmar Reserva';
            btnConfirmar.disabled = false;
        }
    }
}

// ===== WHATSAPP =====
function buildWhatsAppLink(payload) {
    const dataFormatada = payload.data_passeio
        ? new Date(`${payload.data_passeio}T12:00:00`).toLocaleDateString('pt-BR')
        : '-';

    const mensagem = encodeURIComponent(
        `🌊 *Solicitação de Reserva*\n\n`
        + `📋 *Passeio:* ${payload.passeio_titulo}\n`
        + `👤 *Nome:* ${payload.nome_cliente}\n`
        + `📧 *E-mail:* ${payload.email_cliente}\n`
        + `📱 *Tel:* ${payload.telefone_cliente}\n`
        + `📅 *Data:* ${dataFormatada}\n`
        + `⏰ *Horário:* ${payload.horario_passeio}\n`
        + `👥 *Pessoas:* ${payload.quantidade_pessoas}\n`
        + (payload.observacoes ? `📝 *Obs:* ${payload.observacoes}\n` : '')
    );

    return `https://wa.me/5522981709100?text=${mensagem}`;
}

// ===== UTILITÁRIOS =====
function escHtml(valor) {
    if (!valor) return '';

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatarData(valor) {
    if (!valor) return '-';
    const data = new Date(`${valor}T12:00:00`);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ===== INTERSECTION OBSERVER =====
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.animationPlayState = 'running';
        cardObserver.unobserve(entry.target);
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
});
