 CUBOS-WEB
 =========

 Aplicacion web para simular una estrategia financiera basada en tres cubos
 de dinero. Permite proyectar retiros mensuales, aportes externos, inflacion,
 rentabilidades y rebalanceos durante varios anos.


 FUNCIONALIDADES
 ---------------

 - Simulacion mensual de tres cubos.
 - Retiros mensuales ajustados anualmente por inflacion.
 - Aporte externo mensual al Cubo 1.
 - Ano de inicio configurable para el aporte externo.
 - Opcion para aplicar inflacion anual al aporte externo.
 - Rentabilidad anual configurable para el Cubo 2.
 - Rentabilidad independiente para cada ano del Cubo 3.
 - Rebalanceo automatico del Cubo 2 al Cubo 1.
 - Rebalanceo automatico del Cubo 3 al Cubo 2.
 - Graficos de evolucion de los cubos mediante Chart.js.
 - Total mensual del patrimonio, calculado como la suma de los tres cubos.
 - Aviso cuando el patrimonio total se agota, indicando el año y mes.
 - Tabla mensual con tooltips y senalizacion de rebalanceos.
 - Exportacion del estado completo a PDF.
 - Exportacion del modelo completo a Excel con varias hojas.
 - Tema claro u oscuro adaptado automáticamente a la preferencia del sistema.
 - Popup con los detalles del modelo de simulacion.


 MODELO DE SIMULACION
 --------------------

 La simulacion genera 12 meses por cada rentabilidad introducida para el
 Cubo 3. Por ejemplo, 5 rentabilidades generan 60 registros mensuales.

 En cada mes se calcula tambien `totalFin`, que es la suma de `c1Fin`, `c2Fin`
 y `c3Fin` despues de aplicar retiros, rentabilidades y rebalanceos.

 Cada mes se calcula:

	 retiroMensual = retiroInicial * (1 + inflacion) ^ (anoRelativo - 1)

 Si se ha marcado la opcion de inflacion del aporte:

	 aporteExterno = aporteInicial * (1 + inflacion) ^ (anoRelativo - 1)

 En caso contrario, el aporte permanece constante durante toda la simulacion.

 La evolucion mensual del Cubo 1 comienza con:

	 c1PostRetiro = c1Inicio + aporteExterno - retiroMensual

 Las rentabilidades y rebalanceos se aplican en diciembre:
 1. Se comprueba si el Cubo 1 necesita cubrir el minimo establecido por
		`retiroMensual * mesesCubrir`.
 2. Se aplica la rentabilidad anual del Cubo 2.
 3. Se aplica la rentabilidad anual del Cubo 3.
 4. Si Cubos 1 y 2 no pueden conservar los meses a cubrir, se transfiere
		primero dinero del Cubo 3, aunque baje de `minimoC3`.
 5. Después se transfiere dinero del Cubo 2 al Cubo 1.
 6. La prioridad absoluta es mantener el Cubo 1 con saldo.
 7. Los cubos agotados se fijan en cero.


 PARAMETROS DE ENTRADA
 ---------------------

 - Ano inicial: ano de comienzo de la simulacion.
 - Cubo 1 inicial: saldo destinado principalmente a los retiros.
 - Cubo 2 inicial: reserva intermedia con rentabilidad anual.
 - Cubo 3 inicial: reserva de largo plazo.
 - Retiro mensual: importe inicial retirado del Cubo 1.
 - Aporte externo mensual: dinero adicional que entra cada mes en el Cubo 1.
 - Ano inicio aporte externo: ano absoluto a partir del cual empieza a recibirse
	 el aporte mensual.
 - Aplicar inflacion anual: aumenta el aporte externo cada ano si esta activo.
 - Inflacion anual: tasa usada para actualizar el retiro y, opcionalmente,
	 el aporte externo. Ejemplo: `0,04` equivale al 4 por ciento.
 - Rentabilidad C2: rentabilidad anual del Cubo 2.
 - Meses a cubrir: numero de meses que deben cubrir los cubos.
 - Minimo Cubo 3: saldo minimo que se conserva en el Cubo 3.
 - Rentabilidades anuales Cubo 3: lista separada por punto y coma, una tasa
	 por cada ano. Ejemplo: `0,05;-0,03;0,07`.

 Los selectores de indice y escenario rellenan automaticamente esta lista con
 los datos integrados en `js/escenarios-c3.js`. La lista sigue siendo editable
 antes de ejecutar la simulacion.

 Las tasas negativas son validas siempre que sean superiores a -100 por ciento.
 Los saldos no pueden ser negativos, el retiro debe ser mayor que cero y debe
 existir al menos una rentabilidad anual para el Cubo 3.


 RESULTADOS Y EXPORTACION
 ------------------------

 La tabla muestra, por mes:

	 Ano | Mes | Retiro mensual | Aporte externo opcional |
	 Cubo 1 Inicio | Cubo 1 Fin | Cubo 2 Inicio | Cubo 2 Fin |
	Cubo 3 Inicio | Cubo 3 Fin | Total | Rebalanceo

 La columna de aporte externo solo aparece cuando el importe simulado es
 distinto de cero. La misma regla y el mismo orden se aplican a la hoja
 `Resultados` del archivo Excel.

 La exportacion a Excel genera un libro con estas hojas:

 - `Parametros`: valores usados para ejecutar la simulacion.
 - `Resultados`: tabla mensual completa.
 - `Datos graficos`: serie mensual de los saldos finales de los tres cubos y
	 del total patrimonial.

 La exportacion a PDF genera un unico documento con una portada de parametros,
 una pagina con los dos graficos y la tabla completa de resultados con
 paginacion automatica.

 Es necesario ejecutar una simulacion antes de exportar. Si no existen
 resultados, la aplicacion muestra un aviso y no intenta crear el archivo.

 El boton `Ver detalles del modelo` abre un popup con el flujo mensual y las
 reglas de rebalanceo sin abandonar la pagina principal.


 ESTRUCTURA DEL PROYECTO
 -----------------------

 cubos-web/
 |-- index.html              Interfaz, formulario y carga de dependencias.
 |-- css/
 |   `-- estilos.css         Estilos generales y tema automático.
 |-- js/
 |   |-- utils.js             Utilidades compartidas, como nombreMes().
 |   |-- modelos.js           ParametrosSimulacion y MesSimulado.
 |   |-- simulacion.js        Logica financiera de la simulacion.
 |   |-- graficos.js          Graficos de evolucion con Chart.js.
 |   |-- tabla.js             Tabla, formato y tooltips de resultados.
 |   |-- escenarios-c3.js     Carga y seleccion de escenarios del Cubo 3.
 |   `-- ui.js                Eventos, validacion y exportaciones.
 `-- assets/                  Recursos estaticos adicionales.


 COMO EJECUTARLO
 ---------------

 No requiere un proceso de compilacion. Abre `index.html` directamente en un
 navegador moderno o sirve la carpeta con cualquier servidor web estatico.

 La pagina carga desde CDN las dependencias externas:

 - Chart.js para los graficos.
 - SheetJS/XLSX para la exportacion a Excel.
 - jsPDF y AutoTable para la exportacion a PDF.

 Por tanto, los graficos y las exportaciones requieren acceso a Internet,
 salvo que las dependencias se descarguen y se sirvan localmente.