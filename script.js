let originalImage = null;
let hasImage = false;
let hasProcessed = false;

function init() {
    const fileInput = document.getElementById('fileInput');
    const uploadCard = document.querySelector('.upload-card');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const thresholdInput = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');

    // Update threshold display
    thresholdInput.addEventListener('input', () => {
        thresholdValue.textContent = thresholdInput.value;
    });

    // File input change
    fileInput.addEventListener('change', handleUpload);

    // Drag and drop
    uploadCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadCard.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    uploadCard.addEventListener('dragleave', () => {
        uploadCard.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    uploadCard.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadCard.style.background = 'rgba(255, 255, 255, 0.1)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadImage(file);
    });

    processBtn.addEventListener('click', processImage);
    downloadBtn.addEventListener('click', downloadImage);
}

function handleUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
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
            document.getElementById('percentage').textContent = 'N/A';
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
    const threshold = parseInt(document.getElementById('threshold').value) * 2.55; // Scale 0-100 to 0-255
    const targetRgb = hexToRgb(colorHex);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Redraw original image
    ctx.drawImage(originalImage, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let matchingCount = 0;
    let totalCount = 0;

    // Process pixels
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 0) {
            totalCount++;
            const distance = calculateDistance(r, g, b, targetRgb[0], targetRgb[1], targetRgb[2]);
            if (distance < threshold) {
                matchingCount++;
            } else {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
        }
    }

