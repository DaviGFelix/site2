(() => {
    const API_TIMEOUT = 8000;
    const REFRESH_INTERVAL = 10 * 60 * 1000;
    const DEFAULT_CONFIG = {
        lat: '-22.96583',
        lon: '-42.02778',
        place: 'Arraial do Cabo, RJ',
        timezone: 'America/Sao_Paulo'
    };

    const DESTINATION_CONFIG = {
        'arraial do cabo': { lat: '-22.96583', lon: '-42.02778', place: 'Arraial do Cabo, RJ', timezone: 'America/Sao_Paulo' },
        'buzios': { lat: '-22.74694', lon: '-41.88167', place: 'Búzios, RJ', timezone: 'America/Sao_Paulo' },
        'cabo frio': { lat: '-22.87944', lon: '-42.01861', place: 'Cabo Frio, RJ', timezone: 'America/Sao_Paulo' },
        'angra dos reis': { lat: '-23.00667', lon: '-44.31806', place: 'Angra dos Reis, RJ', timezone: 'America/Sao_Paulo' },
        'ilha grande': { lat: '-23.14111', lon: '-44.16722', place: 'Ilha Grande, RJ', timezone: 'America/Sao_Paulo' },
        'paraty': { lat: '-23.21778', lon: '-44.71306', place: 'Paraty, RJ', timezone: 'America/Sao_Paulo' },
        'rio de janeiro': { lat: '-22.90685', lon: '-43.17290', place: 'Rio de Janeiro, RJ', timezone: 'America/Sao_Paulo' },
        'petropolis': { lat: '-22.50500', lon: '-43.17861', place: 'Petrópolis, RJ', timezone: 'America/Sao_Paulo' }
    };

    function normalizarTexto(valor = '') {
        return String(valor)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function escHtml(valor) {
        if (!valor) return '';

        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function obterConfigDestino(destino = '') {
        const textoNormalizado = normalizarTexto(destino);
        if (!textoNormalizado) return { ...DEFAULT_CONFIG };

        const match = Object.entries(DESTINATION_CONFIG).find(([chave]) => (
            textoNormalizado.includes(chave) || chave.includes(textoNormalizado)
        ));

        if (match) return { ...match[1] };

        return {
            ...DEFAULT_CONFIG,
            place: destino.includes(',') ? destino : `${destino}, RJ`
        };
    }

    function resolverConfigWidget(widget) {
        const destinoPreferencial = widget.dataset.destino || widget.dataset.place || DEFAULT_CONFIG.place;
        const configDestino = obterConfigDestino(destinoPreferencial);

        return {
            lat: widget.dataset.lat || configDestino.lat,
            lon: widget.dataset.lon || configDestino.lon,
            place: widget.dataset.place || configDestino.place,
            timezone: widget.dataset.timezone || configDestino.timezone
        };
    }

    async function initAll() {
        const widgets = [...document.querySelectorAll('.js-clima-widget')];
        if (!widgets.length) return;

        widgets.forEach((widget, index) => {
            if (!widget.id) widget.id = `clima-widget-${index + 1}`;
        });

        await Promise.all(widgets.map((widget) => carregarClima(widget)));

        if (!window.__climaWidgetsAutoRefresh) {
            window.__climaWidgetsAutoRefresh = window.setInterval(() => {
                document.querySelectorAll('.js-clima-widget').forEach((widget) => carregarClima(widget));
            }, REFRESH_INTERVAL);
        }
    }

    async function carregarClima(widget) {
        if (!widget) return;

        const config = resolverConfigWidget(widget);
        const latitude = config.lat;
        const longitude = config.lon;
        const timezone = config.timezone;
        const place = config.place;
        const diasPrevisao = 5;

        widget.dataset.lat = latitude;
        widget.dataset.lon = longitude;
        widget.dataset.place = place;
        widget.dataset.timezone = timezone;

        widget.innerHTML = `
            <div class="clima__loading">
                <i class="fas fa-cloud-sun"></i>
                <p>Atualizando clima, vento e mar de ${escHtml(place)}...</p>
            </div>
        `;

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT);

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
                throw new Error(`Falha ao buscar mar: ${respostaMar.status}`);
            }

            const [dadosClima, dadosMar] = await Promise.all([
                respostaClima.json(),
                respostaMar.json()
            ]);

            renderizarClima(widget, dadosClima, dadosMar, config);
        } catch (error) {
            console.warn('Não foi possível carregar o widget de clima.', error);
            widget.innerHTML = `
                <div class="clima__erro">
                    <i class="fas fa-cloud-rain"></i>
                    <p>Não foi possível atualizar o widget agora. Tente novamente em instantes.</p>
                    <button class="button js-clima-retry" type="button">
                        <i class="fas fa-rotate-right"></i> Tentar novamente
                    </button>
                </div>
            `;
            widget.querySelector('.js-clima-retry')?.addEventListener('click', () => carregarClima(widget));
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function renderizarClima(widget, dadosClima, dadosMar, config) {
        if (!widget || !dadosClima?.current) return;

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

        const detailsId = `clima-details-${widget.id}`;
        const place = escHtml(config.place);

        widget.innerHTML = `
            <div class="clima__hero-shell">
                <div class="clima__hero-summary">
                    <div class="clima__hero-primary">
                        <div class="clima__hero-location">
                            <span class="clima__eyebrow"><i class="fas fa-satellite-dish"></i> Atualização automática a cada 10 min</span>
                            <div class="clima__city">${place}</div>
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
                        <button class="clima__details-toggle" type="button" aria-expanded="false" aria-controls="${detailsId}">
                            <i class="fas fa-water"></i> Ver detalhes do mar
                        </button>
                    </div>
                </div>

                <div class="clima__details" id="${detailsId}" hidden>
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
                            <span><i class="fas fa-location-dot"></i> Coordenadas monitoradas para ${place}</span>
                            <span><i class="fas fa-calendar-days"></i> Previsão estendida para 5 dias</span>
                        </div>
                        <p class="clima__source">Fontes: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> e <a href="https://marine-api.open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo Marine</a></p>
                    </div>
                </div>
            </div>
        `;

        const detailsToggle = widget.querySelector('.clima__details-toggle');
        const detailsPanel = widget.querySelector(`#${detailsId}`);

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

    function formatarDataHora(valor) {
        if (!valor) return '--';
        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return '--';
        return data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    window.ClimaWidgetManager = {
        initAll,
        refreshAll() {
            document.querySelectorAll('.js-clima-widget').forEach((widget) => carregarClima(widget));
        },
        refreshWidget(widget) {
            return carregarClima(widget);
        },
        applyDestino(widget, destino = '') {
            if (!widget) return;
            const config = obterConfigDestino(destino || DEFAULT_CONFIG.place);
            widget.dataset.destino = destino || '';
            widget.dataset.place = config.place;
            widget.dataset.lat = config.lat;
            widget.dataset.lon = config.lon;
            widget.dataset.timezone = config.timezone;
            return carregarClima(widget);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
