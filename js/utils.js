class Utils {
    static nombreMes(numeroMes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        return meses[numeroMes - 1] || "";
    }
}
