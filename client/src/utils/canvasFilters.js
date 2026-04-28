
// Utility functions for applying filters to a canvas

export const applyBrightness = (imageData, value) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] += 255 * value;
        data[i + 1] += 255 * value;
        data[i + 2] += 255 * value;
    }
};

export const applyContrast = (imageData, value) => {
    const data = imageData.data;
    const factor = (1 + value);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
};

export const applyGrayscale = (imageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
};

export const applySepia = (imageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
};

// A simple box blur implementation
export const applyBlur = (ctx, canvas, radius) => {
    if (radius <= 0) return;
    ctx.globalAlpha = 0.5; // Controls the blur intensity
    for (let y = -radius; y <= radius; y += 2) {
        for (let x = -radius; x <= radius; x += 2) {
            ctx.drawImage(canvas, x, y);
        }
    }
    ctx.globalAlpha = 1.0;
};
