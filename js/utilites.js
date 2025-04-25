export async function loadTemplate(url, elementId){
    const response = await fetch(url);
    if (response.ok){
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    }
}
