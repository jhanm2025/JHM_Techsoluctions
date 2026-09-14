// Cálculo de IVA (Colombia) consistente con backend/app/utils.py -> calcular_iva
export const IVA_PORCENTAJE = 19;

export function calcularIva(precioBase) {
    const base = Number(precioBase) || 0;
    const valorIva = Math.round(base * (IVA_PORCENTAJE / 100) * 100) / 100;
    const precioTotal = Math.round((base + valorIva) * 100) / 100;
    return {
        precioBase: base,
        ivaPorcentaje: IVA_PORCENTAJE,
        valorIva,
        precioTotal,
    };
}

export function formatearMoneda(valor) {
    return `$${Number(valor || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
