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
        document.getElementById('resultadosPanel').hidden = false;
        document.getElementById('graficosPanel').hidden = false;
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
// EXPORTAR A EXCEL
// ===========================
document.getElementById("btnExcel").addEventListener("click", () => {

    const simulacion = obtenerUltimaSimulacion();
    if (!simulacion) return;

    const incluirAporteExterno = simulacion.some(m => m.aporteExterno !== 0);
    const wb = XLSX.utils.book_new();

    const wsParametros = XLSX.utils.aoa_to_sheet(obtenerParametrosExportacion());
    wsParametros['!cols'] = [{ wch: 32 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, wsParametros, "Parametros");

    const wsResultados = XLSX.utils.json_to_sheet(
        crearDatosResultados(simulacion, incluirAporteExterno)
    );
    formatearHojaResultados(wsResultados, incluirAporteExterno);
    XLSX.utils.book_append_sheet(wb, wsResultados, "Resultados");

    const datosGraficos = simulacion.map(m => ({
        anio: m.anio,
        mes: Utils.nombreMes(((m.mes - 1) % 12) + 1),
        cubo1: m.c1Fin,
        cubo2: m.c2Fin,
        cubo3: m.c3Fin
    }));
    const wsGraficos = XLSX.utils.json_to_sheet(datosGraficos);
    formatearColumnasNumericas(wsGraficos, ["cubo1", "cubo2", "cubo3"]);
    XLSX.utils.book_append_sheet(wb, wsGraficos, "Datos graficos");

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
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const parametros = obtenerParametrosExportacion();

    doc.setFontSize(18);
    doc.text("Simulacion Tres Cubos - Estado completo", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periodo: ${simulacion[0].anio} - ${simulacion[simulacion.length - 1].anio}`, 14, 22);

    doc.autoTable({
        head: [["Parametro", "Valor"]],
        body: parametros,
        startY: 29,
        tableWidth: 130,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [77, 121, 255] }
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Graficos de evolucion", 14, 15);
    insertarGraficoEnPdf(doc, "graficoC1C2", 14, 24, 128);
    insertarGraficoEnPdf(doc, "graficoC3", 154, 24, 128);

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Tabla completa de resultados", 14, 15);
    doc.autoTable({
        html: "#tablaResultados",
        startY: 22,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [77, 121, 255] },
        didParseCell: function (data) {
            if (data.section === "body" && data.cell.raw !== "" && !isNaN(data.cell.raw)) {
                data.cell.text = formatearNumero(Number(data.cell.raw));
            }
        }
    });

    doc.save("simulacion_cubos.pdf");
});

function obtenerParametrosExportacion() {
    const nombres = [
        ["Ano inicial", "anioInicial"],
        ["Cubo 1 inicial", "c1Inicial"],
        ["Cubo 2 inicial", "c2Inicial"],
        ["Cubo 3 inicial", "c3Inicial"],
        ["Retiro mensual inicial", "retiro"],
        ["Aporte externo mensual", "aporteExterno"],
        ["Inflacion del aporte", "inflacionAporte"],
        ["Inflacion anual", "inflacion"],
        ["Rentabilidad Cubo 2", "rentabC2"],
        ["Meses a cubrir", "mesesCubrir"],
        ["Minimo Cubo 3", "minimoC3"],
        ["Rentabilidades anuales Cubo 3", "rentabC3"]
    ];

    return nombres.map(([nombre, id]) => {
        const elemento = document.getElementById(id);
        let valor = elemento.value;
        if (elemento.type === "checkbox") valor = elemento.checked ? "Si" : "No";
        return [nombre, valor];
    });
}

function crearDatosResultados(simulacion, incluirAporteExterno) {
    return simulacion.map(m => {
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
}

function formatearColumnasNumericas(hoja, columnasNumericas) {
    Object.keys(hoja).forEach(key => {
        if (key[0] === '!') return;

        const celda = hoja[key];
        const posicion = XLSX.utils.decode_cell(key);
        if (posicion.r === 0) {
            celda.t = "s";
            return;
        }

        const encabezado = hoja[XLSX.utils.encode_cell({ r: 0, c: posicion.c })].v;
        if (columnasNumericas.includes(encabezado)) {
            celda.v = Math.round(Number(celda.v));
            celda.t = "n";
            celda.z = "#,##0;[Red]-#,##0";
        }
    });
}

function formatearHojaResultados(hoja, incluirAporteExterno) {
    const columnasNumericas = [
        "c1Inicio", "c1Fin", "c2Inicio", "c2Fin", "c3Inicio", "c3Fin",
        "retiroMensual", "rebalanceo2a1", "rebalanceo3a2"
    ];
    if (incluirAporteExterno) columnasNumericas.push("aporteExterno");

    formatearColumnasNumericas(hoja, columnasNumericas);
    hoja['!cols'] = [
        { wch: 10 }, { wch: 14 }, { wch: 16 },
        ...(incluirAporteExterno ? [{ wch: 16 }] : []),
        { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
        { wch: 14 }, { wch: 14 }, { wch: 18 }
    ];
}

function insertarGraficoEnPdf(doc, id, x, y, ancho) {
    const canvas = document.getElementById(id);
    const datos = canvas.toDataURL("image/png", 1);
    const alto = ancho * canvas.height / canvas.width;
    doc.addImage(datos, "PNG", x, y, ancho, alto);
}

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

