// ===== PÁGINA DE DETALHES DO PASSEIO =====

let passeioAtual = null;
let todosPasseiosRelacionados = [];
let galeriaSwiper = null;
let thumbsSwiper = null;
let relacionadosSwiper = null;

const API_TIMEOUT = 8000;
const PAGE_ASSET_BUSTER = Date.now();
let siteMedia = {
    asset_version: String(PAGE_ASSET_BUSTER),
    branding: {
        logo_url: 'https://www.genspark.ai/api/files/s/eTJcP2Bb',
        logo_alt: 'Simplesmente Arraial do Cabo'
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initDetalhes();
});

async function initDetalhes() {
    const urlParams = new URLSearchParams(window.location.search);
    const passeioId = urlParams.get('id');

    if (!passeioId) {
        mostrarErro();
        return;
    }

    setupNavegacao();
    setupScroll();
    setupForm();
    await carregarMidiasDoSite();
    aplicarBrandingSite();

    await carregarPasseio(passeioId);
}

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
        console.warn('Falha ao carregar branding global do site.', error);
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

// ===== API =====
async function buscarPasseioViaApi(id) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(`api/passeios.php?id=${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Falha ao buscar passeio: ${response.status}`);
        }

        const payload = await response.json();
        if (!payload?.success || !payload.data) {
            throw new Error(payload?.message || 'Resposta inválida da API.');
        }

        return normalizarPasseioDetalhes(payload.data);
    } finally {
        clearTimeout(timeoutId);
    }
}

async function buscarPasseiosViaApi() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch('api/passeios.php', {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Falha ao buscar lista: ${response.status}`);
        }

        const payload = await response.json();
        if (!payload?.success || !Array.isArray(payload.data)) {
            throw new Error(payload?.message || 'Resposta inválida da API.');
        }

        return payload.data.map(normalizarPasseioDetalhes);
    } finally {
        clearTimeout(timeoutId);
    }
}

function normalizarPasseioDetalhes(passeio) {
    const imagemPrincipal = resolverAssetUrl(passeio.imagemUrl || passeio.imagem_url || '');
    const galeria = Array.isArray(passeio.galeria) && passeio.galeria.length
        ? passeio.galeria.map(item => resolverAssetUrl(item))
        : (imagemPrincipal ? [imagemPrincipal] : []);
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
        descricaoDetalhada: passeio.descricaoDetalhada || passeio.descricao_detalhada || '',
        duracao: passeio.duracao || '',
        destaque: Boolean(passeio.destaque),
        imagemUrl: imagemPrincipal,
        galeria,
        valor: passeio.valor || passeio.preco_label || 'Consulte-nos',
        precoLabel: passeio.precoLabel || passeio.preco_label || passeio.valor || 'Consulte-nos',
        precoValor: passeio.precoValor || passeio.preco_valor || null,
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

function formatarListaCurta(lista = []) {
    return Array.isArray(lista) && lista.length ? lista.join(', ') : '-';
}

function renderizarListaInfo(containerId, items, itemClass, iconClass) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const lista = Array.isArray(items) ? items.filter(Boolean) : [];
    container.innerHTML = lista.map((item) => `<div class="${itemClass}"><i class="fas ${iconClass}"></i><span>${escaparHtml(item)}</span></div>`).join('');
}

function popularHorariosDetalhes(passeio) {
    const selectHorario = document.getElementById('horario');
    if (!selectHorario) return;
    const opcoes = ['<option value="">Selecione o horário</option>'];
    (passeio?.horarios || []).forEach((horario) => opcoes.push(`<option value="${escaparHtml(horario)}">${escaparHtml(horario)}</option>`));
    if (passeio?.permitirACombinar) opcoes.push('<option value="A combinar">A combinar</option>');
    selectHorario.innerHTML = opcoes.join('');
}

function aplicarConfiguracoesReservaDetalhes(passeio) {
    popularHorariosDetalhes(passeio);
    const pessoasInput = document.getElementById('pessoas');
    if (pessoasInput) {
        pessoasInput.min = passeio?.minPessoas || 1;
        pessoasInput.max = passeio?.maxPessoas || 50;
        pessoasInput.value = String(passeio?.minPessoas || 1);
    }
}

function aplicarClimaDoPasseio(passeio) {
    const climaWidget = document.querySelector('.js-clima-widget');
    if (!climaWidget) return;

    const destino = passeio?.destino || 'Arraial do Cabo';

    if (window.ClimaWidgetManager?.applyDestino) {
        window.ClimaWidgetManager.applyDestino(climaWidget, destino);
        return;
    }

    climaWidget.dataset.destino = destino;
    climaWidget.dataset.place = destino.includes(',') ? destino : `${destino}, RJ`;
}

// ===== CARREGAR PASSEIO =====
async function carregarPasseio(id) {
    try {
        passeioAtual = await buscarPasseioViaApi(id);
    } catch (erroApi) {
        console.warn('Falha ao carregar passeio via API. Aplicando fallback local.', erroApi);

        passeioAtual = typeof window.getPasseioExpandido === 'function'
            ? normalizarPasseioDetalhes(window.getPasseioExpandido(id))
            : null;

        if (!passeioAtual && typeof window.getTodosPasseios === 'function') {
            const todosPasseios = window.getTodosPasseios();
            const encontrado = todosPasseios.find(p => p.id === id);
            if (encontrado) {
                passeioAtual = normalizarPasseioDetalhes(encontrado);
            }
        }
    }

    if (!passeioAtual) {
        mostrarErro();
        return;
    }

    renderizarPasseio();
    initSwipers();
    await carregarRelacionados();
    ocultarLoading();
}

// ===== RENDERIZAR PASSEIO =====
function escaparHtml(texto = '') {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function contemHtmlPermitido(texto = '') {
    return /<\s*(p|br|ul|ol|li|strong|em|b|i|u|h2|h3|h4|hr|a)\b/i.test(texto);
}

function limparPrefixoLista(linha = '') {
    return linha.replace(/^([\-*•◦▪▫■□●✔✅☑️✓]|\d+[.)])\s+/u, '').trim();
}

function linhaPareceLista(linha = '') {
    return /^([\-*•◦▪▫■□●✔✅☑️✓]|\d+[.)])\s+/u.test(linha)
        || /^[\u2600-\u27BF\u{1F300}-\u{1FAFF}]\s+/u.test(linha);
}

function linhaPareceTitulo(linha = '') {
    const texto = linha.trim();
    if (!texto || linhaPareceLista(texto) || texto.length > 90) return false;
    return texto.endsWith(':')
        || /^[\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u.test(texto)
        || /^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0-9][^.!?]*$/u.test(texto);
}

function sanitizarHtmlBasico(html = '') {
    const template = document.createElement('template');
    template.innerHTML = html;

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

function formatarDescricaoDetalhada(conteudo = '') {
    const texto = String(conteudo || '').replace(/\r\n?/g, '\n').trim();
    if (!texto) return '';

    if (contemHtmlPermitido(texto)) {
        return sanitizarHtmlBasico(texto);
    }

    const blocos = texto.split(/\n{2,}/).map((bloco) => bloco.trim()).filter(Boolean);

    return blocos.map((bloco) => {
        const blocoSemEspacos = bloco.replace(/\s+/g, '');
        if (/^[-_]{3,}$/u.test(blocoSemEspacos)) {
            return '<hr>';
        }

        const linhas = bloco.split('\n').map((linha) => linha.trim()).filter(Boolean);
        if (!linhas.length) return '';

        if (linhas.length === 1 && linhaPareceTitulo(linhas[0])) {
            return `<h3>${escaparHtml(linhas[0].replace(/:$/, ''))}</h3>`;
        }

        if (linhas.every(linhaPareceLista)) {
            return `<ul>${linhas.map((linha) => `<li>${escaparHtml(limparPrefixoLista(linha))}</li>`).join('')}</ul>`;
        }

        return `<p>${linhas.map((linha) => escaparHtml(linha)).join('<br>')}</p>`;
    }).join('');
}

function renderizarPasseio() {
    document.getElementById('breadcrumb-current').textContent = passeioAtual.titulo;
    document.getElementById('page-title').textContent = `${passeioAtual.titulo} - Simplesmente Arraial do Cabo`;

    const categoriaEl = document.getElementById('passeio-categoria');
    categoriaEl.innerHTML = `<i class="fas ${getIconeCategoria(passeioAtual.categoria)}"></i><span>${passeioAtual.categoria}</span>`;

    document.getElementById('passeio-titulo').textContent = passeioAtual.titulo;
    document.getElementById('passeio-destino').textContent = passeioAtual.destino || 'Diversos destinos';
    document.getElementById('passeio-duracao').textContent = passeioAtual.duracao || 'A consultar';
    document.getElementById('sidebar-duracao').textContent = passeioAtual.duracao || 'A consultar';
    document.getElementById('passeio-descricao').textContent = passeioAtual.descricao || '';

    if (passeioAtual.destaque) {
        document.getElementById('destaque-badge').style.display = 'flex';
    }

    if (passeioAtual.descricaoDetalhada) {
        document.getElementById('passeio-descricao-detalhada').innerHTML = formatarDescricaoDetalhada(passeioAtual.descricaoDetalhada);
    } else {
        document.getElementById('passeio-descricao-detalhada').innerHTML = `
            <h3>Sobre este passeio</h3>
            <p>${passeioAtual.descricao || 'Consulte mais informações diretamente com nossa equipe.'}</p>
        `;
    }

    const valor = passeioAtual.precoLabel || passeioAtual.valor || 'Consulte-nos';
    document.getElementById('sidebar-valor').textContent = valor;
    document.getElementById('mobile-valor').textContent = valor;
    document.getElementById('modal-passeio-titulo').textContent = passeioAtual.titulo;
    document.getElementById('sidebar-grupos').textContent = passeioAtual.gruposLabel || 'Aceita grupos';
    document.getElementById('sidebar-idiomas').textContent = formatarListaCurta(passeioAtual.idiomas);

    renderizarListaInfo('passeio-highlights', passeioAtual.destaques, 'highlight-item', 'fa-check-circle');
    renderizarListaInfo('reserva-garantias', passeioAtual.garantias, 'garantia-item', 'fa-shield-alt');
    aplicarConfiguracoesReservaDetalhes(passeioAtual);
    aplicarClimaDoPasseio(passeioAtual);

    renderizarGaleria();
}

// ===== RENDERIZAR GALERIA =====
function renderizarGaleria() {
    const galeriaPrincipal = document.getElementById('galeria-principal');
    const galeriaThumbs = document.getElementById('galeria-thumbs');

    const imagens = passeioAtual.galeria && passeioAtual.galeria.length
        ? passeioAtual.galeria
        : ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'];

    galeriaPrincipal.innerHTML = imagens.map(img => `
        <div class="swiper-slide">
            <a href="${img}" class="glightbox" data-gallery="passeio-gallery">
                <img src="${img}" alt="${passeioAtual.titulo}" data-gallery="passeio-gallery" loading="lazy">
            </a>
        </div>
    `).join('');

    galeriaThumbs.innerHTML = imagens.map(img => `
        <div class="swiper-slide">
            <img src="${img}" alt="${passeioAtual.titulo}" loading="lazy">
        </div>
    `).join('');
}

// ===== INICIALIZAR SWIPERS =====
function initSwipers() {
    thumbsSwiper = new Swiper('.galeria-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            320: { slidesPerView: 3 },
            640: { slidesPerView: 4 },
            768: { slidesPerView: 5 },
            1024: { slidesPerView: 6 }
        }
    });

    galeriaSwiper = new Swiper('.galeria-swiper', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.galeria-swiper .swiper-button-next',
            prevEl: '.galeria-swiper .swiper-button-prev',
        },
        pagination: {
            el: '.galeria-swiper .swiper-pagination',
            clickable: true,
        },
        thumbs: {
            swiper: thumbsSwiper,
        },
        keyboard: {
            enabled: true,
        },
    });

    GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
    });
}

// ===== CARREGAR PASSEIOS RELACIONADOS =====
async function carregarRelacionados() {
    try {
        todosPasseiosRelacionados = await buscarPasseiosViaApi();
    } catch (erroApi) {
        console.warn('Falha ao carregar relacionados via API. Aplicando fallback local.', erroApi);
        todosPasseiosRelacionados = typeof window.getTodosPasseios === 'function'
            ? window.getTodosPasseios().map(normalizarPasseioDetalhes)
            : [];
    }

    let relacionados = todosPasseiosRelacionados.filter(p =>
        p.id !== passeioAtual.id &&
        (p.destino === passeioAtual.destino || p.categoria === passeioAtual.categoria)
    );

    if (relacionados.length < 6) {
        const outros = todosPasseiosRelacionados.filter(p =>
            p.id !== passeioAtual.id &&
            !relacionados.some(r => r.id === p.id)
        );
        relacionados = [...relacionados, ...outros].slice(0, 8);
    }

    renderizarRelacionados(relacionados);
}

function renderizarRelacionados(passeios) {
    const container = document.getElementById('passeios-relacionados');

    container.innerHTML = passeios.map(p => {
        const imagem = p.imagemUrl || p.imagem_url || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80';
        const destino = p.destino || '';
        const duracao = p.duracao || '';
        const valor = p.precoLabel || p.valor || 'Consulte-nos';

        return `
            <div class="swiper-slide">
                <article class="passeio__card" onclick="irParaPasseio('${p.id}')">
                    <div class="passeio__image-wrapper">
                        <img src="${imagem}" alt="${p.titulo}" class="passeio__image" loading="lazy">
                        <span class="passeio__badge">
                            <i class="fas ${getIconeCategoria(p.categoria)}"></i> ${p.categoria}
                        </span>
                        ${p.destaque ? '<span class="passeio__tag-destaque"><i class="fas fa-star"></i> Destaque</span>' : ''}
                    </div>
                    <div class="passeio__content">
                        <div class="passeio__header">
                            <h3 class="passeio__title">${p.titulo}</h3>
                            ${destino ? `<div class="passeio__location"><i class="fas fa-map-marker-alt"></i><span>${destino}</span></div>` : ''}
                        </div>
                        <p class="passeio__description">${p.descricao || ''}</p>
                        <div class="passeio__info">
                            ${duracao ? `<div class="passeio__info-item"><i class="fas fa-clock"></i><span>${duracao}</span></div>` : ''}
                            <div class="passeio__info-item"><i class="fas fa-tag"></i><span>${p.categoria}</span></div>
                        </div>
                        <div class="passeio__footer">
                            <div class="passeio__price">
                                <span class="passeio__price-label">Valor</span>
                                <span class="passeio__price-value">${valor}</span>
                            </div>
                            <button class="passeio__button">
                                <i class="fas fa-arrow-right"></i> Ver Detalhes
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        relacionadosSwiper = new Swiper('.relacionados-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                nextEl: '.relacionados-swiper .swiper-button-next',
                prevEl: '.relacionados-swiper .swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            }
        });
    }, 100);
}

// ===== NAVEGAÇÃO =====
function setupNavegacao() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navMenu = document.getElementById('nav-menu');

    navToggle?.addEventListener('click', () => navMenu.classList.add('show-menu'));
    navClose?.addEventListener('click', () => navMenu.classList.remove('show-menu'));
}

// ===== SCROLL =====
function setupScroll() {
    const header = document.getElementById('header');
    const scrollTopBtn = document.getElementById('scroll-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY >= 50) header.classList.add('scroll-header');
        else header.classList.remove('scroll-header');

        if (scrollTopBtn) {
            if (window.scrollY >= 400) scrollTopBtn.classList.add('show');
            else scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== FORMULÁRIO =====
function setupForm() {
    const form = document.getElementById('form-reserva');
    form?.addEventListener('submit', handleReservaSubmit);

    const dataInput = document.getElementById('data');
    if (dataInput) {
        dataInput.min = new Date().toISOString().split('T')[0];
    }

    const telefoneInput = document.getElementById('telefone');
    telefoneInput?.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length <= 10) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        e.target.value = v;
    });
}

async function handleReservaSubmit(e) {
    e.preventDefault();

    if (!passeioAtual) return;

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const pessoas = parseInt(document.getElementById('pessoas').value);
    const observ = document.getElementById('observacoes').value.trim();

    if (!nome || !email || !telefone || !data || !horario || !pessoas) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const minPessoas = passeioAtual.minPessoas || 1;
    const maxPessoas = passeioAtual.maxPessoas || 50;
    if (pessoas < minPessoas || pessoas > maxPessoas) {
        alert(`A quantidade de pessoas permitida para este passeio é de ${minPessoas} a ${maxPessoas}.`);
        return;
    }

    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btnConfirmar.disabled = true;

    const payload = {
        passeio_id: passeioAtual.id,
        passeio_titulo: passeioAtual.titulo,
        nome_cliente: nome,
        email_cliente: email,
        telefone_cliente: telefone,
        data_passeio: data,
        horario_passeio: horario,
        quantidade_pessoas: pessoas,
        observacoes: observ,
    };

    try {
        const resp = await fetch('api/reservas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const json = await resp.json();

        if (json.success) {
            fecharModal();
            const waLink = json.whatsapp || buildWhatsAppLink(payload);
            document.getElementById('btn-whatsapp-sucesso').href = waLink;
            document.getElementById('modal-sucesso').classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            alert('Erro ao registrar reserva: ' + (json.message || 'Tente novamente.'));
        }
    } catch (err) {
        console.warn('API offline – abrindo WhatsApp diretamente.', err);
        const waLink = buildWhatsAppLink(payload);
        fecharModal();
        document.getElementById('btn-whatsapp-sucesso').href = waLink;
        document.getElementById('modal-sucesso').classList.add('show');
        document.body.style.overflow = 'hidden';
    } finally {
        btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Confirmar Reserva';
        btnConfirmar.disabled = false;
    }
}

function buildWhatsAppLink(p) {
    const dataFmt = p.data_passeio
        ? new Date(p.data_passeio + 'T12:00:00').toLocaleDateString('pt-BR')
        : '-';

    const msg = encodeURIComponent(
        `🌊 *Solicitação de Reserva*\n\n`
        + `📋 *Passeio:* ${p.passeio_titulo}\n`
        + `👤 *Nome:* ${p.nome_cliente}\n`
        + `📧 *E-mail:* ${p.email_cliente}\n`
        + `📱 *Tel:* ${p.telefone_cliente}\n`
        + `📅 *Data:* ${dataFmt}\n`
        + `⏰ *Horário:* ${p.horario_passeio}\n`
        + `👥 *Pessoas:* ${p.quantidade_pessoas}\n`
        + (p.observacoes ? `📝 *Obs:* ${p.observacoes}\n` : '')
    );
    return `https://wa.me/5522981709100?text=${msg}`;
}

// ===== AÇÕES =====
function abrirModalReserva() {
    document.getElementById('modal-reserva').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    document.getElementById('modal-reserva').classList.remove('show');
    document.body.style.overflow = '';
}

function fecharModalSucesso() {
    document.getElementById('modal-sucesso').classList.remove('show');
    document.body.style.overflow = '';
}

function scrollToReserva() {
    const reservaCard = document.getElementById('reserva-card');
    if (reservaCard) {
        reservaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        abrirModalReserva();
    }
}

function abrirWhatsApp() {
    if (!passeioAtual) return;
    const msg = encodeURIComponent(
        `Olá! Gostaria de mais informações sobre o passeio:\n\n${passeioAtual.titulo}\n\nDestino: ${passeioAtual.destino || 'Diversos'}`
    );
    window.open(`https://wa.me/5522981709100?text=${msg}`, '_blank');
}

function irParaPasseio(id) {
    window.location.href = `passeio-detalhes.html?id=${id}`;
}

// ===== COMPARTILHAR =====
function compartilharFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function compartilharTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(passeioAtual?.titulo || 'Confira este passeio incrível!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function compartilharWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Confira este passeio: ${passeioAtual?.titulo || ''}\n\n`);
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
}

function copiarLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
}

// ===== UTILITÁRIOS =====
function getIconeCategoria(categoria) {
    const icones = {
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
        'Combo': 'fa-layer-group',
    };
    return icones[categoria] || 'fa-compass';
}

function mostrarErro() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-section').style.display = 'block';
}

function ocultarLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}
