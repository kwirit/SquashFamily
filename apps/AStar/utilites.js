export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function loadTemplate(url, elementId){
    const response = await fetch(url);
    if (response.ok){
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    }
    else console.error('Error load template');
}
