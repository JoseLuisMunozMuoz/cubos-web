let chartC1C2 = null;
let chartC3 = null;
//let chartPie = null;

/*function dibujarGraficoC1C2(lista) {

    const ctx = document.getElementById('graficoC1C2');

    const labels = lista.map(m => m.mes);
    const datosC1 = lista.map(m => m.c1Fin);
    const datosC2 = lista.map(m => m.c2Fin);

    if (chartC1C2) chartC1C2.destroy();

    chartC1C2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cubo 1',
                    data: datosC1,
                    borderColor: '#ff4d4d',
                    pointRadius: 4,
                    pointBackgroundColor: '#ff4d4d',
                    tension: 0.1
                },
                {
                    label: 'Cubo 2',
                    data: datosC2,
                    borderColor: '#4d79ff',
                    pointRadius: 4,
                    pointBackgroundColor: '#4d79ff',
                    tension: 0.1
                }
            ]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        title: ctx => {
                            const mes = ctx[0].label;
                            const mesNombre = Utils.nombreMes(((mes - 1) % 12) + 1);
                            const anio = lista[mes - 1].anio;
                            return `${mesNombre} ${anio}`;
                        },
                        label: ctx => {
                            const valor = ctx.raw.toLocaleString('es-ES', { maximumFractionDigits: 0 });
                            return `${ctx.dataset.label}: ${valor} €`;
                        }
                    }
                }
            }
        }
    });
}*/
function dibujarGraficoC1C2(lista) {

    const canvas = document.getElementById('graficoC1C2');
    const ctx = canvas.getContext('2d');

    const labels = lista.map(m => m.mes);
    const datosC1 = lista.map(m => m.c1Fin);
    const datosC2 = lista.map(m => m.c2Fin);

    if (chartC1C2) chartC1C2.destroy();

    chartC1C2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cubo 1',
                    data: datosC1,
                    borderColor: '#ff4d4d',
                    backgroundColor: crearDegradado(ctx, '#ff4d4d'),
                    pointRadius: 4,
                    pointBackgroundColor: '#ff4d4d',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'Cubo 2',
                    data: datosC2,
                    borderColor: '#4d79ff',
                    backgroundColor: crearDegradado(ctx, '#4d79ff'),
                    pointRadius: 4,
                    pointBackgroundColor: '#4d79ff',
                    tension: 0.3,
                    borderWidth: 2
                }
            ]
        },
        options: {
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            },
            plugins: {
                tooltip: {
                    backgroundColor: '#1e1e1e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#444',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: ctx => {
                            const mes = ctx[0].label;
                            const mesNombre = Utils.nombreMes(((mes - 1) % 12) + 1);
                            const anio = lista[mes - 1].anio;
                            return `${mesNombre} ${anio}`;
                        },
                        label: ctx => {
                            const valor = ctx.raw.toLocaleString('es-ES', { maximumFractionDigits: 0 });
                            return `${ctx.dataset.label}: ${valor} €`;
                        }
                    }
                },
                legend: {
                    labels: {
                        font: { size: 14, weight: '600' },
                        color: '#333'
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: '#e0e0e0' },
                    ticks: { callback: v => v.toLocaleString('es-ES') + ' €' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}




/*function dibujarGraficoC3(lista) {

    const ctx = document.getElementById('graficoC3');

    const labels = lista.map(m => m.mes);
    const datosC3 = lista.map(m => m.c3Fin);

    if (chartC3) chartC3.destroy();

    chartC3 = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cubo 3',
                    data: datosC3,
                    borderColor: '#33cc33',
                    pointRadius: 4,
                    pointBackgroundColor: '#33cc33',
                    tension: 0.1
                }
            ]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        title: ctx => {
                            const mes = ctx[0].label;
                            const mesNombre = Utils.nombreMes(((mes - 1) % 12) + 1);
                            const anio = lista[mes - 1].anio;
                            return `${mesNombre} ${anio}`;
                        },
                        label: ctx => {
                            const valor = ctx.raw.toLocaleString('es-ES', { maximumFractionDigits: 0 });
                            return `Cubo 3: ${valor} €`;
                        }
                    }
                }
            }
        }
    });
}*/

function dibujarGraficoC3(lista) {

    const canvas = document.getElementById('graficoC3');
    const ctx = canvas.getContext('2d');

    const labels = lista.map(m => m.mes);
    const datosC3 = lista.map(m => m.c3Fin);

    if (chartC3) chartC3.destroy();

    chartC3 = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cubo 3',
                    data: datosC3,
                    borderColor: '#33cc33',
                    backgroundColor: crearDegradado(ctx, '#33cc33'),
                    pointRadius: 5,
                    pointBackgroundColor: '#33cc33',
                    tension: 0.3,
                    borderWidth: 2
                }
            ]
        },
        options: {
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            },
            plugins: {
                tooltip: {
                    backgroundColor: '#1e1e1e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#444',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: ctx => {
                            const mes = ctx[0].label;
                            const mesNombre = Utils.nombreMes(((mes - 1) % 12) + 1);
                            const anio = lista[mes - 1].anio;
                            return `${mesNombre} ${anio}`;
                        },
                        label: ctx => {
                            const valor = ctx.raw.toLocaleString('es-ES', { maximumFractionDigits: 0 });
                            return `Cubo 3: ${valor} €`;
                        }
                    }
                },
                legend: {
                    labels: {
                        font: { size: 14, weight: '600' },
                        color: '#333'
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: '#e0e0e0' },
                    ticks: { callback: v => v.toLocaleString('es-ES') + ' €' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}


function crearDegradado(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color + "cc");   // 80% opacity
    gradient.addColorStop(1, color + "00");   // transparent
    return gradient;
}

/*function dibujarPie(lista) {

    const ultimo = lista[lista.length - 1];

    const ctx = document.getElementById('graficoPie');

    if (chartPie) chartPie.destroy();

    chartPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cubo 1', 'Cubo 2', 'Cubo 3'],
            datasets: [{
                data: [ultimo.c1Fin, ultimo.c2Fin, ultimo.c3Fin],
                backgroundColor: ['#ff4d4d', '#4d79ff', '#33cc33']
            }]
        }
    });
}*/
