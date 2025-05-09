export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

