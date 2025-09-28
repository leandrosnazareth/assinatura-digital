const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let desenhando = false;
let lastX, lastY;

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    // Corrige para escala real do canvas
    x *= canvas.width / rect.width;
    y *= canvas.height / rect.height;
    return [x, y];
}

function iniciarDesenho(e) {
    desenhando = true;
    [lastX, lastY] = getPos(e);
}
function desenhar(e) {
    if (!desenhando) return;
    e.preventDefault();
    const [x, y] = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [x, y];
}
function pararDesenho() {
    desenhando = false;
}
canvas.addEventListener('mousedown', iniciarDesenho);
canvas.addEventListener('mousemove', desenhar);
canvas.addEventListener('mouseup', pararDesenho);
canvas.addEventListener('mouseout', pararDesenho);
canvas.addEventListener('touchstart', iniciarDesenho);
canvas.addEventListener('touchmove', desenhar);
canvas.addEventListener('touchend', pararDesenho);
function limparCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function salvarAssinatura() {
    document.getElementById('imagemBase64').value = canvas.toDataURL();
    return true;
}

// --- Zoom Modal ---
let modalZoom = document.getElementById('modalZoom');
let canvasZoom = document.getElementById('canvasZoom');
let ctxZoom = canvasZoom.getContext('2d');
let desenhandoZoom = false;
let lastXZoom, lastYZoom;

function abrirZoom() {
    // Copia assinatura atual para o canvas ampliado
    ctxZoom.clearRect(0, 0, canvasZoom.width, canvasZoom.height);
    let img = new window.Image();
    img.onload = function () {
        ctxZoom.drawImage(img, 0, 0, canvasZoom.width, canvasZoom.height);
    };
    img.src = canvas.toDataURL();
    let modal = new bootstrap.Modal(modalZoom);
    modal.show();
}
function getPosZoom(e) {
    const rect = canvasZoom.getBoundingClientRect();
    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    // Corrige para escala real do canvas ampliado
    x *= canvasZoom.width / rect.width;
    y *= canvasZoom.height / rect.height;
    return [x, y];
}
function iniciarDesenhoZoom(e) {
    desenhandoZoom = true;
    [lastXZoom, lastYZoom] = getPosZoom(e);
}
function desenharZoom(e) {
    if (!desenhandoZoom) return;
    e.preventDefault();
    const [x, y] = getPosZoom(e);
    ctxZoom.beginPath();
    ctxZoom.moveTo(lastXZoom, lastYZoom);
    ctxZoom.lineTo(x, y);
    ctxZoom.strokeStyle = '#222';
    // Ajusta a largura da linha proporcionalmente ao tamanho do canvas
    ctxZoom.lineWidth = 2.2 * (canvasZoom.width / canvas.width);
    ctxZoom.lineCap = 'round';
    ctxZoom.stroke();
    [lastXZoom, lastYZoom] = [x, y];
}
function pararDesenhoZoom() {
    desenhandoZoom = false;
}
canvasZoom.addEventListener('mousedown', iniciarDesenhoZoom);
canvasZoom.addEventListener('mousemove', desenharZoom);
canvasZoom.addEventListener('mouseup', pararDesenhoZoom);
canvasZoom.addEventListener('mouseout', pararDesenhoZoom);
canvasZoom.addEventListener('touchstart', iniciarDesenhoZoom);
canvasZoom.addEventListener('touchmove', desenharZoom);
canvasZoom.addEventListener('touchend', pararDesenhoZoom);
function limparCanvasZoom() {
    ctxZoom.clearRect(0, 0, canvasZoom.width, canvasZoom.height);
}
function salvarZoom() {
    // Copia assinatura ampliada para o canvas principal mantendo a espessura proporcional
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redimensiona a imagem mantendo a espessura proporcional
    let imgData = ctxZoom.getImageData(0, 0, canvasZoom.width, canvasZoom.height);
    // Cria um canvas temporário para ajustar a espessura
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    let tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(canvasZoom, 0, 0, canvasZoom.width, canvasZoom.height, 0, 0, canvas.width, canvas.height);
    // Fecha modal
    let modal = bootstrap.Modal.getInstance(modalZoom);
    if (modal) modal.hide();
}