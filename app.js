const btnProcessText = document.getElementById("btnProcessText");
const btnProcessPdf = document.getElementById("btnProcessPdf");
const btnClear = document.getElementById("btnClear");

const inputText = document.getElementById("inputText");
const pdfInput = document.getElementById("pdfInput");
const numQuestionsText = document.getElementById("numQuestionsText");
const numQuestionsPdf = document.getElementById("numQuestionsPdf");

const summaryOutput = document.getElementById("summaryOutput");
const questionsOutput = document.getElementById("questionsOutput");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");

const API_BASE = "http://localhost:8000";  // backend FastAPI

function showLoader(show) {
    if (show) {
        loader.classList.remove("hidden");
    } else {
        loader.classList.add("hidden");
    }
}

function showError(message) {
    if (!message) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
        return;
    }
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

function renderResult(data) {
    summaryOutput.innerHTML = data.summary || "<em>No se pudo generar resumen.</em>";
    questionsOutput.innerHTML = "";

    if (Array.isArray(data.questions) && data.questions.length > 0) {
        data.questions.forEach(q => {
            const li = document.createElement("li");
            li.textContent = q;
            questionsOutput.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.innerHTML = "<em>No se generaron preguntas.</em>";
        questionsOutput.appendChild(li);
    }
}

// ----------------------
// TEXTO
// ----------------------
btnProcessText.addEventListener("click", async () => {
    const text = inputText.value.trim();
    const n = parseInt(numQuestionsText.value, 10) || 5;

    if (!text) {
        showError("Por favor, pega algún texto para procesar.");
        return;
    }

    // Limpiar resultados previos
    showError("");
    summaryOutput.innerHTML = "<em>Generando resumen...</em>";
    questionsOutput.innerHTML = "";
    showLoader(true);

    try {
        const response = await fetch(`${API_BASE}/api/process-text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                num_questions: n
            })
        });

        if (!response.ok) {
            throw new Error("Error en el servidor (" + response.status + ")");
        }

        const data = await response.json();
        renderResult(data);
    } catch (err) {
        console.error(err);
        showError("Ocurrió un error al procesar el texto. Revisa la consola.");
    } finally {
        showLoader(false);
    }
});

// ----------------------
// PDF
// ----------------------
btnProcessPdf.addEventListener("click", async () => {
    const file = pdfInput.files[0];
    const n = parseInt(numQuestionsPdf.value, 10) || 5;

    if (!file) {
        showError("Selecciona un archivo PDF primero.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("num_questions", n.toString());

    // Limpiar resultados previos
    showError("");
    summaryOutput.innerHTML = "<em>Procesando PDF...</em>";
    questionsOutput.innerHTML = "";
    showLoader(true);

    try {
        const response = await fetch(`${API_BASE}/api/process-pdf`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error en el servidor (" + response.status + ")");
        }

        const data = await response.json();
        renderResult(data);
    } catch (err) {
        console.error(err);
        showError("Ocurrió un error al procesar el PDF. Revisa la consola.");
    } finally {
        showLoader(false);
    }
});

// ----------------------
// LIMPIAR
// ----------------------
btnClear.addEventListener("click", () => {
    inputText.value = "";
    pdfInput.value = "";
    numQuestionsText.value = 5;
    numQuestionsPdf.value = 5;

    summaryOutput.innerHTML = "<em>El resumen aparecerá aquí...</em>";
    questionsOutput.innerHTML = "";
    showError("");
});
