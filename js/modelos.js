class ParametrosSimulacion {
    constructor(anioInicial, c1, c2, c3, retiro, aporteExterno, inflacionAporte, inflacion, rentabC2, mesesCubrir, minimoC3, rentabC3) {
        this.anioInicial = anioInicial;
        this.c1Inicial = c1;
        this.c2Inicial = c2;
        this.c3Inicial = c3;
        this.retiro = retiro;
        this.aporteExterno = aporteExterno;
        this.inflacionAporte = inflacionAporte;
        this.inflacion = inflacion;
        this.rentabC2 = rentabC2;
        this.mesesCubrir = mesesCubrir;
        this.minimoC3 = minimoC3;
        this.rentabC3 = rentabC3;
    }
}

class MesSimulado {
    constructor(mes, anio, datos) {
        this.mes = mes;
        this.anio = anio;
        Object.assign(this, datos);
    }
}
