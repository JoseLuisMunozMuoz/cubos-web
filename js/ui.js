window.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('btnSimular');

    btn.addEventListener('click', () => {

        const errorValidacion = validarCampos();
        if (errorValidacion) {
            console.log(errorValidacion);
            alert(errorValidacion);
            return;
        }

        const p = leerParametros();

        const lista = simularCubos(p);
        window.ULTIMA_SIMULACION = lista;

        actualizarTabla(lista);
        dibujarGraficoC1C2(lista);
        dibujarGraficoC3(lista);
        //dibujarPie(lista);

        const ultimo = lista[lista.length - 1];
        console.log('Cubo 1 final:', ultimo.c1Fin);
        console.log('Cubo 2 final:', ultimo.c2Fin);
        console.log('Cubo 3 final:', ultimo.c3Fin);
    });
});

function leerParametros() {

    const anioInicial = +document.getElementById('anioInicial').value;
    const c1 = +document.getElementById('c1Inicial').value;
    const c2 = +document.getElementById('c2Inicial').value;
    const c3 = +document.getElementById('c3Inicial').value;
    const retiro = +document.getElementById('retiro').value;
    const aporteExterno = +document.getElementById('aporteExterno').value;
    const inflacionAporte = document.getElementById('inflacionAporte').checked;
    const inflacion = +document.getElementById('inflacion').value;
    const rentabC2 = +document.getElementById('rentabC2').value;
    const mesesCubrir = +document.getElementById('mesesCubrir').value;
    const minimoC3 = +document.getElementById('minimoC3').value;

    const rentabC3Texto = document.getElementById('rentabC3').value;
    /*const rentabC3 = rentabC3Texto.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(Number);*/
    const rentabC3 = parsearRentabilidadesC3(
        document.getElementById("rentabC3").value);



    return new ParametrosSimulacion(
        anioInicial,
        c1, c2, c3,
        retiro, aporteExterno, inflacionAporte,
        inflacion,
        rentabC2,
        mesesCubrir,
        minimoC3,
        rentabC3
    );
}

function validarCampos() {
    const valores = {};
    const idsNumericos = [
        'anioInicial', 'c1Inicial', 'c2Inicial', 'c3Inicial',
        'retiro', 'aporteExterno', 'inflacion', 'rentabC2', 'mesesCubrir', 'minimoC3'
    ];

    for (const id of idsNumericos) {
        const texto = document.getElementById(id).value.trim();
        if (texto === '') return `El campo "${id}" es obligatorio.`;

        const valor = Number(texto);
        if (!Number.isFinite(valor)) return `El campo "${id}" debe ser numérico.`;

        valores[id] = valor;
    }

    if (!Number.isInteger(valores.anioInicial) || valores.anioInicial <= 0) {
        return 'El año inicial debe ser un número entero mayor que cero.';
    }
    if (valores.c1Inicial < 0 || valores.c2Inicial < 0 || valores.c3Inicial < 0) {
        return 'Los saldos iniciales no pueden ser negativos.';
    }
    if (valores.retiro <= 0) {
        return 'El retiro mensual debe ser mayor que cero.';
    }
    if (valores.aporteExterno < 0) {
        return 'El aporte externo mensual no puede ser negativo.';
    }
    if (valores.inflacion <= -1) {
        return 'La inflación debe ser mayor que -100%.';
    }
    if (valores.rentabC2 <= -1) {
        return 'La rentabilidad del Cubo 2 debe ser mayor que -100%.';
    }
    if (!Number.isInteger(valores.mesesCubrir) || valores.mesesCubrir <= 0) {
        return 'Los meses a cubrir deben ser un número entero mayor que cero.';
    }
    if (valores.minimoC3 < 0) {
        return 'El mínimo del Cubo 3 no puede ser negativo.';
    }

    const textoRentabilidades = document.getElementById('rentabC3').value.trim();
    if (textoRentabilidades === '') {
        return 'Debes introducir al menos una rentabilidad anual del Cubo 3.';
    }

    const rentabilidades = textoRentabilidades.split(';');
    for (const rentabilidadTexto of rentabilidades) {
        const valor = rentabilidadTexto.trim().replace(',', '.');
        if (valor === '' || !Number.isFinite(Number(valor))) {
            return 'Las rentabilidades del Cubo 3 deben ser números separados por punto y coma.';
        }
        if (Number(valor) <= -1) {
            return 'Las rentabilidades del Cubo 3 deben ser mayores que -100%.';
        }
    }

    return null;
}

// ===========================
// MODO OSCURO
// ===========================
const switchDark = document.getElementById("darkModeSwitch");

switchDark.addEventListener("change", () => {
    document.body.classList.toggle("dark", switchDark.checked);
    localStorage.setItem("modoOscuro", switchDark.checked ? "1" : "0");
});

// Cargar preferencia guardada
window.addEventListener("DOMContentLoaded", () => {
    const modo = localStorage.getItem("modoOscuro");
    if (modo === "1") {
        document.body.classList.add("dark");
        switchDark.checked = true;
    }
});

// ===========================
// EXPORTAR A EXCEL
// ===========================
document.getElementById("btnExcel").addEventListener("click", () => {

    const simulacion = obtenerUltimaSimulacion();
    if (!simulacion) return;

    // 1. Crear un array limpio SOLO con los campos que queremos exportar
    const incluirAporteExterno = simulacion.some(m => m.aporteExterno !== 0);
    const datos = simulacion.map(m => {
        const fila = {
            anio: m.anio,
            mes: Utils.nombreMes(((m.mes - 1) % 12) + 1),
            retiroMensual: m.retiroMensual
        };

        if (incluirAporteExterno) fila.aporteExterno = m.aporteExterno;

        Object.assign(fila, {
            c1Inicio: m.c1Inicio,
            c1Fin: m.c1Fin,
            c2Inicio: m.c2Inicio,
            c2Fin: m.c2Fin,
            c3Inicio: m.c3Inicio,
            c3Fin: m.c3Fin,
            rebalanceo2a1: m.rebalanceo2a1,
            rebalanceo3a2: m.rebalanceo3a2
        });

        return fila;
    });

    // 2. Crear hoja desde datos puros
    const ws = XLSX.utils.json_to_sheet(datos);

    // 3. Columnas numéricas sin decimales
    const columnasNumericas = [
        "c1Inicio", "c1Fin",
        "c2Inicio", "c2Fin",
        "c3Inicio", "c3Fin",
        "retiroMensual",
        "rebalanceo2a1", "rebalanceo3a2"
    ];
    if (incluirAporteExterno) columnasNumericas.push("aporteExterno");

    // 4. Aplicar formato SOLO a filas de datos (fila 1 en adelante)
    Object.keys(ws).forEach(key => {
        if (key[0] === '!') return; // metadatos

        const celda = ws[key];
        const pos = XLSX.utils.decode_cell(key);

        // ❗ Saltar la fila 0 (cabecera)
        if (pos.r === 0) {
            celda.t = "s"; // asegurar texto
            return;
        }

        const header = ws[XLSX.utils.encode_cell({ r: 0, c: pos.c })].v;

        // Año y mes → texto
        if (header === "anio" || header === "mes") {
            celda.t = "s";
            return;
        }

        // Columnas numéricas → entero sin decimales
        if (columnasNumericas.includes(header)) {
            celda.v = Math.round(Number(celda.v)); // entero puro
            celda.t = "n";
            celda.z = "#,##0;[Red]-#,##0"; // miles sin decimales + negativos en rojo
        }
    });

    // 5. Exportar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, "simulacion_cubos.xlsx");
});


/*document.getElementById("btnExcel").addEventListener("click", () => {

    // 1. Obtener los datos reales de la simulación
    const datos = window.ULTIMA_SIMULACION; // ahora te explico esto

    // 2. Crear hoja a partir de datos puros
    const ws = XLSX.utils.json_to_sheet(datos, {
        header: [
            "anio", "mes",
            "c1Inicio", "c1Fin",
            "c2Inicio", "c2Fin",
            "c3Inicio", "c3Fin",
            "rebalanceo2a1", "rebalanceo3a2"
        ]
    });

    // 3. Aplicar formato europeo a las columnas numéricas
    const columnasNumericas = [
        "c1Inicio", "c1Fin",
        "c2Inicio", "c2Fin",
        "c3Inicio", "c3Fin",
        "rebalanceo2a1", "rebalanceo3a2",
        "retiroMensual", "c1PostRetiro", 
        "reb2a1", "c2PostReb2a1",
        "c2PostRentab", "reb3a2",
        "c3PostRentab"
    ];

    Object.keys(ws).forEach(key => {
        if (key[0] === '!') return;

        const celda = ws[key];
        const col = XLSX.utils.decode_cell(key).c;
        const header = ws[XLSX.utils.encode_cell({ r: 0, c: col })].v;

        if (columnasNumericas.includes(header)) {
            celda.t = "n";
            //celda.z = "#,##0.00";
            celda.z = "#,##0";
        }
    });

    // 4. Crear libro y exportar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    XLSX.writeFile(wb, "simulacion_cubos.xlsx");
});*/




// ===========================
// EXPORTAR A PDF
// ===========================
document.getElementById("btnPDF").addEventListener("click", () => {
    const simulacion = obtenerUltimaSimulacion();
    if (!simulacion) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    doc.text("Simulación Tres Cubos - Resultados", 14, 14);

    doc.autoTable({
        html: "#tablaResultados",
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [77, 121, 255] },
        didParseCell: function (data) {
            if (data.cell.raw && !isNaN(data.cell.raw)) {
                data.cell.text = formatearNumero(Number(data.cell.raw));
            }
        }
    });

    doc.save("simulacion_cubos.pdf");
});

function obtenerUltimaSimulacion() {
    if (!Array.isArray(window.ULTIMA_SIMULACION) || window.ULTIMA_SIMULACION.length === 0) {
        alert("Ejecuta una simulación antes de exportar los resultados.");
        return null;
    }

    return window.ULTIMA_SIMULACION;
}

function parsearRentabilidadesC3(cadena) {
    if (!cadena) return [];

    return cadena
        .split(';')                // separar por ;
        .map(v => v.trim())        // limpiar espacios
        .map(v => v.replace(',', '.')) // convertir coma → punto
        .map(v => parseFloat(v))   // convertir a número JS
        .filter(v => !isNaN(v));   // eliminar valores inválidos
}

