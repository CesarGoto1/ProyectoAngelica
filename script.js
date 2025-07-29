const form = document.getElementById('logisticForm');
const formulaEl = document.getElementById('formula');
const descripcionEl = document.getElementById('descripcion');
const ctx = document.getElementById('chart').getContext('2d');
const tablaContainer = document.getElementById('tabla-container');
let chart;

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener valores
    const r = parseFloat(form.r.value);
    const K = parseFloat(form.K.value);
    const P0 = parseFloat(form.P0.value);
    const tMax = parseFloat(form.tMax.value);

    if (K <= 0 || r <= 0 || P0 <= 0 || tMax <= 0) {
        alert('Por favor, ingrese valores positivos mayores que cero.');
        return;
    }

    if (P0 >= K) {
        alert('La población inicial debe ser menor que la capacidad de carga K.');
        return;
    }

    // Mostrar la fórmula con valores usando MathJax
    formulaEl.innerHTML = `\\[
P(t) = \\frac{K}{1 + \\left(\\frac{K - P_0}{P_0}\\right) e^{-r t}}
\\]`;

    // Procesar la fórmula para que MathJax la renderice
    MathJax.typesetPromise();

    // Calcular valores para el gráfico
    const puntos = 100;
    const tiempo = [];
    const poblacion = [];

    for (let i = 0; i <= puntos; i++) {
        const t = (tMax / puntos) * i;
        tiempo.push(t.toFixed(2));
        const Pt = K / (1 + ((K - P0) / P0) * Math.exp(-r * t));
        poblacion.push(Pt.toFixed(2));
    }

    descripcionEl.textContent = `Con r = ${r}, K = ${K}, P0 = ${P0} y tiempo hasta ${tMax}, la población evoluciona según la ecuación logística.`;

    // Generar tabla de datos
    let tablaHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tiempo (t)</th>
                    <th>Población P(t)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let i = 0; i < tiempo.length; i++) {
        tablaHTML += `
            <tr>
                <td>${tiempo[i]}</td>
                <td>${poblacion[i]}</td>
            </tr>
        `;
    }
    
    tablaHTML += `
            </tbody>
        </table>
    `;
    
    tablaContainer.innerHTML = tablaHTML;
    // Graficar
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tiempo,
            datasets: [{
                label: 'Población P(t)',
                data: poblacion,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (t)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Población P(t)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
});