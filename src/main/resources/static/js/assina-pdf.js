// --- Assinatura ampliada ---
const btnAmpliar = document.getElementById('ampliar-assinatura');
const modalAmpliar = document.getElementById('modal-ampliar');
const canvasAmpliado = document.getElementById('canvas-ampliado');
const ctxAmpliado = canvasAmpliado.getContext('2d');
let desenhandoAmpliado = false;

// Definir a espessura do traço proporcional ao canvas principal
function getProportionalLineWidth() {
    // Exemplo: se o canvas principal usa 2px, ajuste proporcionalmente
    const mainLineWidth = 2; // ajuste conforme o padrão do canvas principal
    const proporcao = canvasAmpliado.width / signatureCanvas.width;
    return mainLineWidth * proporcao;
}

btnAmpliar.onclick = function () {
    modalAmpliar.style.display = 'flex';
    ctxAmpliado.clearRect(0, 0, canvasAmpliado.width, canvasAmpliado.height);
};
document.getElementById('fechar-ampliado').onclick = function () {
    modalAmpliar.style.display = 'none';
};
document.getElementById('limpar-ampliado').onclick = function () {
    ctxAmpliado.clearRect(0, 0, canvasAmpliado.width, canvasAmpliado.height);
};
canvasAmpliado.addEventListener('mousedown', function (e) {
    desenhandoAmpliado = true;
    ctxAmpliado.beginPath();
    ctxAmpliado.moveTo(e.offsetX, e.offsetY);
    ctxAmpliado.lineWidth = getProportionalLineWidth();
    ctxAmpliado.lineCap = 'round';
    ctxAmpliado.lineJoin = 'round';
});
canvasAmpliado.addEventListener('mousemove', function (e) {
    if (desenhandoAmpliado) {
        ctxAmpliado.lineTo(e.offsetX, e.offsetY);
        ctxAmpliado.stroke();
    }
});
canvasAmpliado.addEventListener('mouseup', function (e) {
    desenhandoAmpliado = false;
});
canvasAmpliado.addEventListener('mouseleave', function (e) {
    desenhandoAmpliado = false;
});
document.getElementById('usar-ampliado').onclick = function () {
    // Copia a assinatura ampliada para o canvas de assinatura principal
    const img = new window.Image();
    img.onload = function () {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        // Redimensiona proporcionalmente para caber no canvas principal
        ctx.drawImage(img, 0, 0, signatureCanvas.width, signatureCanvas.height);
        signatureDrawn = true;
        modalAmpliar.style.display = 'none';
    };
    img.src = canvasAmpliado.toDataURL('image/png');
};
let pdfDoc = null;
let pageNum = 1;
let signatureDrawn = false;
let signaturePosition = { x: 50, y: 50 };
let dragging = false;
let offset = { x: 0, y: 0 };

const pdfContainer = document.getElementById('pdf-container');
const pdfViewer = document.getElementById('pdf-viewer');
const signatureCanvas = document.getElementById('signature-canvas');
const ctx = signatureCanvas.getContext('2d');
const controls = document.getElementById('controls');


let drawing = false;
let mode = 'draw'; // 'draw' ou 'move'
const toggleBtn = document.getElementById('toggle-mode');

toggleBtn.onclick = function () {
    if (mode === 'draw') {
        mode = 'move';
        toggleBtn.textContent = 'Modo: Mover';
        signatureCanvas.style.cursor = 'move';
    } else {
        mode = 'draw';
        toggleBtn.textContent = 'Modo: Desenhar';
        signatureCanvas.style.cursor = 'crosshair';
    }
};

signatureCanvas.addEventListener('mousedown', function (e) {
    if (mode === 'draw') {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    } else if (mode === 'move') {
        dragging = true;
        offset.x = e.offsetX;
        offset.y = e.offsetY;
    }
});
signatureCanvas.addEventListener('mousemove', function (e) {
    if (mode === 'draw' && drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        signatureDrawn = true;
    }
});
signatureCanvas.addEventListener('mouseup', function (e) {
    drawing = false;
    dragging = false;
});
signatureCanvas.addEventListener('mouseleave', function (e) {
    drawing = false;
    dragging = false;
});

document.getElementById('clear-signature').onclick = function () {
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    signatureDrawn = false;
};

// Arrastar assinatura
signatureCanvas.addEventListener('mousedown', function (e) {
    if (!drawing && signatureDrawn) {
        dragging = true;
        offset.x = e.offsetX;
        offset.y = e.offsetY;
    }
});
document.addEventListener('mousemove', function (e) {
    if (mode === 'move' && dragging) {
        const rect = pdfContainer.getBoundingClientRect();
        let x = e.clientX - rect.left - offset.x;
        let y = e.clientY - rect.top - offset.y;
        signatureCanvas.style.left = x + 'px';
        signatureCanvas.style.top = y + 'px';
        signaturePosition = { x, y };
    }
});
document.addEventListener('mouseup', function (e) {
    dragging = false;
});

// Upload PDF e exibir
const uploadForm = document.getElementById('upload-form');


document.getElementById('btn-upload').onclick = function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData(uploadForm);
    fetch('/upload-pdf', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                const fileURL = URL.createObjectURL(file);
                showPDF(fileURL);
            } else {
                alert('Erro ao enviar PDF');
            }
        });
};

function showPDF(url) {
    pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        pdfDoc.getPage(pageNum).then(function (page) {
            const viewport = page.getViewport({ scale: 1.5 });
            pdfViewer.width = viewport.width;
            pdfViewer.height = viewport.height;
            // tamanho do canvas de 
            signatureCanvas.width = 350;
            signatureCanvas.height = 100;
            signatureCanvas.style.left = '50px';
            signatureCanvas.style.top = '50px';
            pdfContainer.style.width = viewport.width + 'px';
            pdfContainer.style.height = viewport.height + 'px';
            pdfContainer.style.display = 'inline-block';
            controls.style.display = 'block';
            pdfContainer.style.display = 'block';
            // Render PDF
            const renderContext = {
                canvasContext: pdfViewer.getContext('2d'),
                viewport: viewport
            };
            page.render(renderContext);
        });
    });
}

// Aplicar assinatura
const applyBtn = document.getElementById('apply-signature');
applyBtn.onclick = function () {
    if (!signatureDrawn) {
        alert('Desenhe a assinatura primeiro!');
        return;
    }
    // Captura imagem da assinatura
    const signatureDataUrl = signatureCanvas.toDataURL('image/png');
    // Pega a posição real do canvas de assinatura relativa ao pdf-viewer
    const pdfRect = pdfViewer.getBoundingClientRect();
    const sigRect = signatureCanvas.getBoundingClientRect();
    // Posição relativa ao pdf-viewer
    const x = sigRect.left - pdfRect.left;
    const y = sigRect.top - pdfRect.top;
    const nome = document.getElementById('nome') ? document.getElementById('nome').value : '';
    const email = document.getElementById('email') ? document.getElementById('email').value : '';
    fetch('/apply-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            signature: signatureDataUrl,
            x: x,
            y: y,
            nome: nome,
            email: email
        })
    })
        .then(response => response.blob())
        .then(blob => {
            // Baixar PDF assinado
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pdf-assinado.pdf';
            a.click();
        });
};