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

    // Calcular la constante C usando las condiciones iniciales
    // De P(0) = P0, obtenemos: P0 = K / (1 + C)
    // Despejando C: C = (K - P0) / P0
    const C = (K - P0) / P0;

    // Mostrar el proceso de resolución paso a paso
    formulaEl.innerHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3>Resolución de la EDO:</h3>
            <p><strong>Ecuación diferencial:</strong></p>
            \\[\\frac{dP}{dt} = kP, \\quad con \\, k > 0\\]
            
            <p><strong>Separando variables:</strong></p>
            \\[\\frac{dP}{P} = k \\, dt\\]
            
            <p><strong>Integrando ambos lados:</strong></p>
            \\[\\int \\frac{dP}{P} = \\int k \\, dt\\]
            \\[\\ln|P| = kt + C_1\\]
            
            <p><strong>Aplicando exponencial:</strong></p>
            \\[P = e^{kt + C_1} = e^{C_1} \\cdot e^{kt} = C \\cdot e^{kt}\\]
            
            <p><strong>Con valores dados:</strong></p>
            \\[k = ${r}, \\quad K = ${K}, \\quad P_0 = ${P0}\\]
            \\[C = \\frac{K - P_0}{P_0} = \\frac{${K} - ${P0}}{${P0}} = ${C.toFixed(4)}\\]
            
            <p><strong>Solución final:</strong></p>
            \\[P(t) = \\frac{${K}}{1 + ${C.toFixed(4)} \\cdot e^{-${r}t}}\\]
        </div>
    `;

    // Procesar la fórmula para que MathJax la renderice
    MathJax.typesetPromise();

    // Calcular valores para el gráfico usando la fórmula correcta
    const puntos = 100;
    const tiempo = [];
    const poblacion = [];

    for (let i = 0; i <= puntos; i++) {
        const t = (tMax / puntos) * i;
        tiempo.push(parseFloat(t.toFixed(2)));
        
        // Fórmula logística: P(t) = K / (1 + C * e^(-rt))
        // donde C = (K - P0) / P0
        const Pt = K / (1 + C * Math.exp(-r * t));
        poblacion.push(parseFloat(Pt.toFixed(2)));
    }

    descripcionEl.innerHTML = `
        <div style="background: linear-gradient(145deg, #e8f5e8, #d4f4d4); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>Análisis del modelo:</strong><br>
            • Tasa de crecimiento: r = ${r}<br>
            • Capacidad de carga: K = ${K}<br>
            • Población inicial: P₀ = ${P0}<br>
            • Constante de integración: C = ${C.toFixed(4)}<br>
            • Tiempo de análisis: 0 ≤ t ≤ ${tMax}<br><br>
            <em>La población evoluciona según el modelo logístico, tendiendo asintóticamente hacia la capacidad de carga K = ${K}.</em>
        </div>
    `;

    // Generar tabla de datos con más precisión
    let tablaHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tiempo (t)</th>
                    <th>Población P(t)</th>
                    <th>% de K</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Mostrar solo algunos puntos clave en la tabla para mejor legibilidad
    const step = Math.max(1, Math.floor(puntos / 20)); // Mostrar aprox. 20 puntos
    for (let i = 0; i < tiempo.length; i += step) {
        const porcentajeK = ((poblacion[i] / K) * 100).toFixed(1);
        tablaHTML += `
            <tr>
                <td>${tiempo[i]}</td>
                <td>${poblacion[i]}</td>
                <td>${porcentajeK}%</td>
            </tr>
        `;
    }
    
    // Asegurar que el último punto se incluya
    if ((tiempo.length - 1) % step !== 0) {
        const lastIndex = tiempo.length - 1;
        const porcentajeK = ((poblacion[lastIndex] / K) * 100).toFixed(1);
        tablaHTML += `
            <tr>
                <td>${tiempo[lastIndex]}</td>
                <td>${poblacion[lastIndex]}</td>
                <td>${porcentajeK}%</td>
            </tr>
        `;
    }
    
    tablaHTML += `
            </tbody>
        </table>
    `;
    
    tablaContainer.innerHTML = tablaHTML;

    // Graficar con colores mejorados
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
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#FF6B6B',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 6
            }, {
                label: `Capacidad de carga K = ${K}`,
                data: new Array(tiempo.length).fill(K),
                borderColor: '#4ECDC4',
                backgroundColor: 'transparent',
                borderDash: [10, 5],
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#34495e',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            if (context.datasetIndex === 0) {
                                const porcentaje = ((context.parsed.y / K) * 100).toFixed(1);
                                return `${porcentaje}% de la capacidad de carga`;
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
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#495057'
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
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#495057'
                    }
                }
            }
        }
    });
});