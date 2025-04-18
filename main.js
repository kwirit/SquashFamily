async function loadTemplate(url, elementId){
    const response = await fetch(url);
    if (response.ok){
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    }
}


loadTemplate('templates/footer.html', 'footer-templates');
loadTemplate('templates/headerHome.html', 'header-templates');