export async function loadTemplate(url, elementId){
    const response = await fetch(url);
    if (response.ok){
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    }
}

export function setupNav(){
    function setupNavigation() {
        const currentPath = window.location.pathname;

        function updateLinks(basePath) {
            const links = document.querySelectorAll('.dropdown-menu a.dropdown-item');
            links.forEach(link => {
                const href = link.getAttribute('href');
                link.setAttribute('href', basePath + href);
            });
        }

        if (currentPath === '/' || currentPath === '/index.html') {
            updateLinks('');
        } else if (currentPath.startsWith('/apps/')) {
            updateLinks('../');
        } else {
            console.warn('Неизвестный путь:', currentPath);
        }
    }

    setupNavigation();
}