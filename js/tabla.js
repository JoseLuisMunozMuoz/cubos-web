function actualizarTabla(lista) {

    const tabla = document.getElementById('tablaResultados');
    tabla.innerHTML = '';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const incluirAporteExterno = lista.some(m => m.aporteExterno !== 0);

    const headers = [
        'Año', 'Mes',
        'Retiro mensual',
        ...(incluirAporteExterno ? ['Aporte externo'] : []),
        'C1 Inicio', 'C1 Fin',
        'C2 Inicio', 'C2 Fin',
        'C3 Inicio', 'C3 Fin',
        'Rebalanceo'
    ];

    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });

    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement('tbody');

    lista.forEach(m => {

        const tr = document.createElement('tr');

        const r21 = m.rebalanceo2a1 || 0;
        const r32 = m.rebalanceo3a2 || 0;

        // Colores premium
        if (r21 > 0 && r32 > 0) tr.classList.add('tr-both');
        else if (r21 > 0) tr.classList.add('tr-21');
        else if (r32 > 0) tr.classList.add('tr-32');

        // Tooltip premium para cada fila
        let tooltip = `📅 ${Utils.nombreMes(((m.mes - 1) % 12) + 1)} ${m.anio}\n\n` +
                      `💰 Cubo 1: ${formatearNumero(m.c1Fin)} €\n` +
                      `📈 Cubo 2: ${formatearNumero(m.c2Fin)} €\n` +
                      `📊 Cubo 3: ${formatearNumero(m.c3Fin)} €\n\n` +
                      `🔸 Retiro mensual: ${formatearNumero(m.retiroMensual)} €\n`;

        if (m.aporteExterno !== 0) {
            tooltip += `🔸 Aporte externo: ${formatearNumero(m.aporteExterno)} €\n`;
        }

        tooltip += `🔸 Rentab. C3: ${(m.rentabRealC3 * 100).toFixed(2)} %\n`;

        // Tooltip específico si hay rebalanceo
        if (r21 > 0 || r32 > 0) {
            tooltip += `\n🔁 Rebalanceos:\n`;
            if (r32 > 0) tooltip += `   🟩 3 ➜ 2: ${formatearNumero(r32)} €\n`;
            if (r21 > 0) tooltip += `   🟦 2 ➜ 1: ${formatearNumero(r21)} €\n`;
        }

        
        //tr.title = tooltip;
        tr.addEventListener("mouseenter", (e) => mostrarTooltip(e, tooltip));
        tr.addEventListener("mousemove", (e) => mostrarTooltip(e, tooltip));
        tr.addEventListener("mouseleave", ocultarTooltip);

        // Celdas
        const tdAnio = document.createElement('td');
        tdAnio.textContent = m.anio;
        tr.appendChild(tdAnio);

        const tdMes = document.createElement('td');
        tdMes.textContent = Utils.nombreMes(((m.mes - 1) % 12) + 1);
        tr.appendChild(tdMes);

        const tdRetiro = document.createElement('td');
        tdRetiro.textContent = formatearNumero(m.retiroMensual);
        tr.appendChild(tdRetiro);

        if (incluirAporteExterno) {
            const tdAporteExterno = document.createElement('td');
            tdAporteExterno.textContent = formatearNumero(m.aporteExterno);
            tr.appendChild(tdAporteExterno);
        }

        const tdC1Ini = document.createElement('td');
        tdC1Ini.textContent = formatearNumero(m.c1Inicio);
        if (esNegativo(m.c1Inicio)) tdC1Ini.classList.add('negativo');
        tr.appendChild(tdC1Ini);

        const tdC1Fin = document.createElement('td');
        tdC1Fin.textContent = formatearNumero(m.c1Fin);
        if (esNegativo(m.c1Fin)) tdC1Fin.classList.add('negativo');
        tr.appendChild(tdC1Fin);

        const tdC2Ini = document.createElement('td');
        tdC2Ini.textContent = formatearNumero(m.c2Inicio);
        if (esNegativo(m.c2Inicio)) tdC2Ini.classList.add('negativo');
        tr.appendChild(tdC2Ini);

        const tdC2Fin = document.createElement('td');
        tdC2Fin.textContent = formatearNumero(m.c2Fin);
        if (esNegativo(m.c2Fin)) tdC2Fin.classList.add('negativo');
        tr.appendChild(tdC2Fin);

        const tdC3Ini = document.createElement('td');
        tdC3Ini.textContent = formatearNumero(m.c3Inicio);
        if (esNegativo(m.c3Inicio)) tdC3Ini.classList.add('negativo');
        tr.appendChild(tdC3Ini);

        const tdC3Fin = document.createElement('td');
        tdC3Fin.textContent = formatearNumero(m.c3Fin);
        if (esNegativo(m.c3Fin)) tdC3Fin.classList.add('negativo');
        tr.appendChild(tdC3Fin);

        const tdIcono = document.createElement('td');
        let texto = '';
        if (r21 > 0 && r32 > 0) texto = `🟩 3 ➜ 2 🟦  |  🟦 2 ➜ 1 🟥`;
        else if (r21 > 0) texto = `🟦 2 ➜ 1 🟥`;
        else if (r32 > 0) texto = `🟩 3 ➜ 2 🟦`;
        tdIcono.textContent = texto;
        tr.appendChild(tdIcono);

        tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
}


/*function formatearNumero(v) {
    return v.toLocaleString('es-ES', { maximumFractionDigits: 0 });
}*/
function formatearNumero(valor, decimales = 0) {
    if (valor === null || valor === undefined || isNaN(valor)) return "";

    return valor
        .toFixed(decimales)          // decimales
        .replace('.', ',')           // coma decimal
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // puntos de miles
}

// ===========================
// TOOLTIP PREMIUM PARA TABLA
// ===========================

let tooltipDiv = null;

function mostrarTooltip(event, texto) {
    if (!tooltipDiv) {
        tooltipDiv = document.createElement("div");
        tooltipDiv.className = "tooltip";
        document.body.appendChild(tooltipDiv);
    }

    tooltipDiv.textContent = texto;
    tooltipDiv.style.left = (event.pageX + 15) + "px";
    tooltipDiv.style.top = (event.pageY + 15) + "px";
    tooltipDiv.style.opacity = 1;
}

function ocultarTooltip() {
    if (tooltipDiv) {
        tooltipDiv.style.opacity = 0;
    }
}

function esNegativo(valor) {
    return typeof valor === "number" && valor < 0;
}

