let originalImage = null;
let hasImage = false;
let hasProcessed = false;

function init() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Upload area click triggers file input
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleUpload);

    // Drag and drop support
    uploadArea.addEventListener('dragover', (e) => e.preventDefault());
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) loadImage(file);
    });

    processBtn.addEventListener('click', processImage);
    downloadBtn.addEventListener('click', downloadImage);
}

function handleUpload(e) {
    const file = e.target.files[0];
    if (file) loadImage(file);
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        originalImage = new Image();
        originalImage.onload = function() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            ctx.drawImage(originalImage, 0, 0);
            hasImage = true;
            hasProcessed = false;
            document.getElementById('processBtn').disabled = false;
            document.getElementById('downloadBtn').disabled = true;
            document.getElementById('percentage').textContent = 'Percentage: N/A';
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function processImage() {
    if (!hasImage) {
        alert('Please upload an image first.');
        return;
    }

    const colorHex = document.getElementById('colorPicker').value;
    const threshold = parseInt(document.getElementById('threshold').value);
    const targetRgb = hexToRgb(colorHex);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Redraw original image before processing
    ctx.drawImage(originalImage, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let matchingCount = 0;
    let totalCount = 0;

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 0) { // Only consider non-transparent pixels
            totalCount++;
            const distance = calculateDistance(r, g, b, targetRgb[0], targetRgb[1], targetRgb[2]);
            if (distance < threshold) {
                matchingCount++;
            } else {
                // Convert to grayscale
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = gray;     // R
                data[i + 1] = gray; // G
                data[i + 2] = gray; // B
                // Alpha remains unchanged
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    const percentage = totalCount > 0 ? (matchingCount / totalCount * 100).toFixed(2) : 0;
    document.getElementById('percentage').textContent = `Percentage: ${percentage}%`;
    hasProcessed = true;
    document.getElementById('downloadBtn').disabled = false;
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function calculateDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function downloadImage() {
    if (!hasProcessed) return;
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'highlighted_image.png';
    link.click();
}

init();
