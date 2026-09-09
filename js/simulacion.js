/**
 * ============================================================
 *  SimuladorTresCubos (versión JavaScript)
 *  ------------------------------------------------------------
 *  Este módulo implementa la lógica financiera del modelo
 *  “Tres Cubos”, migrado desde la versión Java original.
 *
 *  El simulador genera una lista de objetos MesSimulado,
 *  cada uno representando el estado de los tres cubos en un mes.
 *
 *  El modelo se basa en:
 *    - Retiros mensuales ajustados por inflación
 *    - Rentabilidad anual del Cubo 2
 *    - Rentabilidades anuales del Cubo 3 (lista de valores)
 *    - Rebalanceos automáticos entre cubos según reglas
 *
 * ============================================================
 *
 * 1. PARÁMETROS DE ENTRADA (ParametrosSimulacion)
 * ------------------------------------------------------------
 *  anioInicial      → Año base de la simulación (ej. 2030)
 *  c1Inicial        → Saldo inicial del Cubo 1
 *  c2Inicial        → Saldo inicial del Cubo 2
 *  c3Inicial        → Saldo inicial del Cubo 3
 *  retiro           → Retiro mensual inicial
 *  aporteExterno    → Incremento mensual externo que se suma al Cubo 1
 *  inflacionAporte  → Indica si el aporte aumenta anualmente con la inflación
 *  inflacion        → Inflación anual (ej. 0.02 = 2%)
 *  rentabC2         → Rentabilidad anual del Cubo 2
 *  mesesCubrir      → Meses que debe cubrir cada cubo (x)
 *  minimoC3         → Saldo mínimo permitido en Cubo 3 (y)
 *  rentabC3         → Lista de rentabilidades anuales del Cubo 3
 *
 * ============================================================
 *
 * 2. FLUJO MENSUAL DE LA SIMULACIÓN
 * ------------------------------------------------------------
 *  Para cada mes:
 *
 *   - Se calcula el retiro mensual ajustado por inflación:
 *        retiroMensual = retiro * (1 + inflacion)^(añoRel - 1)
 *
 *   - Se suma el aporte externo y se descuentan los retiros del Cubo 1:
 *        c1PostRetiro = c1Inicio + aporteExterno - retiroMensual
 *
 *   - Si es diciembre:
 *        • Se evalúa si Cubo 1 necesita rebalanceo desde Cubo 2
 *        • Se aplica rentabilidad anual del Cubo 2
 *        • Se aplica rentabilidad anual del Cubo 3
 *        • Se evalúa rebalanceo desde Cubo 3 hacia Cubo 2
 *
 *   - Se registran todos los valores en un objeto MesSimulado
 *
 * ============================================================
 *
 * 3. REGLAS DE REBALANCEO
 * ------------------------------------------------------------
 *
 *  A) Rebalanceo 2 → 1 (reb2a1)
 *  --------------------------------
 *  Se realiza SOLO en diciembre.
 *
 *  Objetivo:
 *      Cubo 1 debe tener al menos:
 *          minCubo1 = retiroMensual * mesesCubrir
 *
 *  Si Cubo 1 queda por debajo:
 *      necesario = minCubo1 - c1PostRetiro
 *      reb2a1 = min(necesario, saldoDisponibleEnCubo2)
 *
 *  Resultado:
 *      c1Fin = c1PostRetiro + reb2a1
 *      c2PostReb2a1 = c2Inicio - reb2a1
 *
 * ------------------------------------------------------------
 *
 *  B) Rebalanceo 3 → 2 (reb3a2)
 *  --------------------------------
 *  También solo en diciembre.
 *
 *  Objetivo:
 *      Cubo 2 debe tener al menos:
 *          minCubo2 = retiroMensual * mesesCubrir
 *
 *  Condiciones:
 *      - Si Cubo 2 queda por debajo del mínimo
 *      - Y Cubo 3 NO ha tenido pérdidas > 10%
 *
 *  Límite:
 *      maxTransferible = c3PostRentab - minimoC3
 *
 *  Resultado:
 *      reb3a2 = min(necesario, maxTransferible)
 *      c2Fin = c2PostRentab + reb3a2
 *      c3Fin = c3PostRentab - reb3a2
 *
 * ============================================================
 *
 * 4. RENTABILIDAD DEL CUBO 3
 * ------------------------------------------------------------
 *  rentabC3 es una lista de valores anuales.
 *
 *  Cada año:
 *      c3PostRentab = c3Inicio * (1 + rentabC3[anioRel - 1])
 *
 *  Se calcula también la rentabilidad REAL del año:
 *      rentabRealC3 = (c3PostRentab - c3InicioAnio) / c3InicioAnio
 *
 *  Si rentabRealC3 < -10%:
 *      → Se bloquea el rebalanceo 3 → 2
 *
 * ============================================================
 *
 * 5. OBJETO MesSimulado
 * ------------------------------------------------------------
 *  Cada mes se devuelve un objeto con:
 *
 *    mes                → número de mes (1..N)
 *    anio               → año absoluto (ej. 2035)
 *
 *    c1Inicio, c1Fin
 *    c2Inicio, c2Fin
 *    c3Inicio, c3Fin
 *
 *    rebalanceo2a1      → importe transferido de C2 a C1
 *    rebalanceo3a2      → importe transferido de C3 a C2
 *
 *    rentabRealC3       → rentabilidad real del año en C3
 *    perdidasMayor10    → booleano
 *
 * ============================================================
 *
 * 6. SALIDA FINAL
 * ------------------------------------------------------------
 *  La función simularCubos(p) devuelve:
 *
 *      Array<MesSimulado>
 *
 *  Con tantos meses como:
 *
 *      rentabC3.length * 12
 *
 * ============================================================
 */

function simularCubos(p) {

    const meses = [];

    let c1 = p.c1Inicial;
    let c2 = p.c2Inicial;
    let c3 = p.c3Inicial;

    let c3InicioAnio = c3;

    const totalAnios = p.rentabC3.length;
    const totalMeses = totalAnios * 12;

    for (let i = 1; i <= totalMeses; i++) {

        const mes = i;
        const anioRel = Math.floor((i - 1) / 12) + 1;
        const esDiciembre = (mes % 12 === 0);

        const retiroMensual = p.retiro * Math.pow(1 + p.inflacion, anioRel - 1);

        const c1Inicio = c1;
        const c2Inicio = c2;
        const c3Inicio = c3;

        const aporteExterno = p.aporteExterno * (
            p.inflacionAporte ? Math.pow(1 + p.inflacion, anioRel - 1) : 1
        );
        let c1PostRetiro = c1Inicio + aporteExterno - retiroMensual;
        const minCubo1 = retiroMensual * p.mesesCubrir;

        let reb2a1 = 0;
        if (esDiciembre) {
            const necesario = Math.max(0, minCubo1 - c1PostRetiro);
            reb2a1 = Math.min(necesario, c2Inicio);
        }
        let c1Fin = c1PostRetiro + reb2a1;

        let c2PostReb2a1 = c2Inicio - reb2a1;

        let c2PostRentab = c2PostReb2a1;
        if (esDiciembre) {
            c2PostRentab *= (1 + p.rentabC2);
        }

        const rentabC3Anual = p.rentabC3[anioRel - 1];
        let c3PostRentab = c3Inicio;

        if (esDiciembre) {
            c3PostRentab = c3Inicio * (1 + rentabC3Anual);
            c3InicioAnio = c3Inicio;
        }

        const rentabRealC3 = c3InicioAnio > 0
            ? (c3PostRentab - c3InicioAnio) / c3InicioAnio
            : 0;

        const perdidasMayor10 = rentabRealC3 < -0.10;

        const minCubo2 = retiroMensual * p.mesesCubrir;
        let reb3a2 = 0;

        if (esDiciembre) {
            if (c2PostRentab === 0) {
                reb3a2 = 0.25 * minCubo2;
            } else if (c2PostRentab < minCubo2 && !perdidasMayor10) {
                const necesario = minCubo2 - c2PostRentab;
                const maxTransferible = c3PostRentab - p.minimoC3;
                reb3a2 = Math.max(0, Math.min(necesario, maxTransferible));
            }
        }

        const c2Fin = c2PostRentab + reb3a2;
        const c3Fin = c3PostRentab - reb3a2;

        const anioAbsoluto = p.anioInicial + anioRel - 1;

        meses.push(new MesSimulado(mes, anioAbsoluto, {
            retiroMensual, aporteExterno,
            c1Inicio, c2Inicio, c3Inicio,
            c1PostRetiro, reb2a1, c1Fin,
            c2PostReb2a1, c2PostRentab, reb3a2, c2Fin,
            c3PostRentab, c3Fin,
            rentabRealC3, perdidasMayor10,
            rebalanceo2a1: reb2a1,
            rebalanceo3a2: reb3a2
        }));

        c1 = c1Fin;
        c2 = c2Fin;
        c3 = c3Fin;
    }

    return meses;
}



