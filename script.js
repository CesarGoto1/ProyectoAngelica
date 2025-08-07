const form = document.getElementById('exponentialForm');
const formulaEl = document.getElementById('formula');
const descripcionEl = document.getElementById('descripcion');
const ctx = document.getElementById('chart').getContext('2d');
const tablaContainer = document.getElementById('tabla-container');
const contenidoResultados = document.getElementById('contenido-resultados');
let chart;

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener valores
    const k = parseFloat(form.r.value);
    const P0 = parseFloat(form.P0.value);
    const K = parseFloat(form.K.value);
    const tMax = parseFloat(form.tMax.value);

    if (k <= 0 || P0 <= 0 || K <= 0 || tMax <= 0) {
        alert('Por favor, ingrese valores positivos mayores que cero.');
        return;
    }

    // Mostrar el contenido de resultados
    contenidoResultados.style.display = 'block';

    // Para el modelo exponencial, C = P₀ (condición inicial)
    const C = P0;

    // ...existing code... (resto del código del formulario sin cambios)

    // Mostrar el proceso de resolución paso a paso
    formulaEl.innerHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3>Fórmula de Crecimiento Exponencial:</h3>
            <p><strong>Fórmula general:</strong></p>
            \\[P(t) = Ce^{kt}\\]
            
            <p><strong>Datos dados:</strong></p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>P₀ = ${P0} (población inicial)</li>
                <li>k = ${k} (tasa de crecimiento)</li>
                <li>K = ${K} (capacidad de carga - para referencia)</li>
                <li>t = tiempo</li>
            </ul>
            
            <p><strong>Paso 1: Encontrando la constante C</strong></p>
            <p>Usando la condición inicial P(0) = P₀:</p>
            \\[P(0) = Ce^{k \\cdot 0} = Ce^0 = C \\cdot 1 = C\\]
            \\[Por\\ tanto:\\ C = P_0 = ${P0}\\]
            
            <p><strong>Paso 2: Sustituyendo los valores en la fórmula</strong></p>
            \\[P(t) = ${P0} \\cdot e^{${k}t}\\]
            
            <p><strong>Fórmula final con datos reemplazados:</strong></p>
            <div style="background: linear-gradient(145deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center;">
                \\[\\boxed{P(t) = ${P0}e^{${k}t}}\\]
            </div>
            
            <p><strong>Verificación en t = 0:</strong></p>
            \\[P(0) = ${P0}e^{${k} \\cdot 0} = ${P0}e^0 = ${P0} \\cdot 1 = ${P0} \\checkmark\\]
        </div>
    `;

    // Procesar la fórmula para que MathJax la renderice
    MathJax.typesetPromise();

    // Calcular valores para el gráfico usando la fórmula exponencial
    const puntosGrafico = 15;
    const tiempo = [];
    const poblacion = [];

    for (let i = 0; i <= puntosGrafico; i++) {
        const t = (tMax / puntosGrafico) * i;
        tiempo.push(parseFloat(t.toFixed(2)));
        
        // Fórmula exponencial: P(t) = C * e^(kt) = P₀ * e^(kt)
        const Pt = C * Math.exp(k * t);
        poblacion.push(parseFloat(Pt.toFixed(2)));
    }

    // Generar colores dinámicos para las barras
    const maxPoblacion = Math.max(...poblacion);
    const colores = poblacion.map((valor) => {
        const intensidad = valor / maxPoblacion;
        if (intensidad < 0.3) return 'rgba(54, 162, 235, 0.8)'; // Azul para valores bajos
        else if (intensidad < 0.7) return 'rgba(78, 205, 196, 0.8)'; // Turquesa para valores medios
        else return 'rgba(255, 107, 107, 0.8)'; // Coral para valores altos
    });

    descripcionEl.innerHTML = `
        <div style="background: linear-gradient(145deg, #e8f5e8, #d4f4d4); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>Análisis del modelo exponencial:</strong><br>
            • Fórmula: P(t) = Ce^(kt)<br>
            • Tasa de crecimiento: k = ${k}<br>
            • Población inicial: P₀ = C = ${P0}<br>
            • Capacidad de carga (referencia): K = ${K}<br>
            • Tiempo de análisis: 0 ≤ t ≤ ${tMax}<br>
            • Población al tiempo máximo: P(${tMax}) = ${poblacion[poblacion.length-1].toLocaleString()}<br><br>
            <em>La población crece exponencialmente sin límite según la fórmula P(t) = ${P0}e^{${k}t}.</em><br>
        </div>
    `;

    // Generar tabla de datos usando la fórmula exponencial
    const puntosTabla = 100;
    const tiempoTabla = [];
    const poblacionTabla = [];
    
    for (let i = 0; i <= puntosTabla; i++) {
        const t = (tMax / puntosTabla) * i;
        tiempoTabla.push(parseFloat(t.toFixed(2)));
        const Pt = C * Math.exp(k * t);
        poblacionTabla.push(parseFloat(Pt.toFixed(2)));
    }

    let tablaHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tiempo (t)</th>
                    <th>P(t) = ${P0}e^(${k}t)</th>
                    <th>Factor de Crecimiento</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Mostrar solo algunos puntos clave en la tabla
    const stepTabla = Math.max(1, Math.floor(puntosTabla / 20));
    for (let i = 0; i < tiempoTabla.length; i += stepTabla) {
        const factorCrecimiento = (poblacionTabla[i] / P0).toFixed(2);
        tablaHTML += `
            <tr>
                <td>${tiempoTabla[i]}</td>
                <td>${poblacionTabla[i].toLocaleString()}</td>
                <td>${factorCrecimiento}x</td>
            </tr>
        `;
    }
    
    tablaHTML += `
            </tbody>
        </table>
    `;
    
    tablaContainer.innerHTML = tablaHTML;

    // Crear gráfico con pocas barras y bien separadas
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tiempo,
            datasets: [{
                label: `P(t) = ${P0}e^(${k}t)`,
                data: poblacion,
                backgroundColor: colores,
                borderColor: colores.map(color => color.replace('0.8', '1')),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
            }, {
                label: `Capacidad de carga K = ${K} (referencia)`,
                data: new Array(tiempo.length).fill(K),
                type: 'line',
                borderColor: '#e74c3c',
                backgroundColor: 'transparent',
                borderDash: [10, 5],
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                order: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#34495e',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            if (context.datasetIndex === 0) {
                                const factorCrecimiento = (context.parsed.y / P0).toFixed(2);
                                return `Factor de crecimiento: ${factorCrecimiento}x`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (t)',
                        color: '#34495e',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#495057',
                        maxRotation: 0,
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Población P(t)',
                        color: '#34495e',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#495057',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
});