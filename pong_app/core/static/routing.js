document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('main-page');

    const renderView = (view) => {
        // Use fetch to load the HTML content of the corresponding view
		console.log(view);
		if (view != "/") {
        fetch(`${view}`)
            .then(response => response.text())
            .then(htmlContent => {
				var div = document.createElement("div");
				div.innerHTML = htmlContent;
                appContainer.appendChild(div);
            })
            .catch(error => {
                console.error('Error fetching view:', error);
            });
		}
		else {
			appContainer.innerHTML = "";
		}
    };

    const handleNavigation = (path) => {
        history.pushState({ path }, '', path);
        renderView(path);
    };

    // Initial load and navigation event listener
    window.addEventListener('popstate', (event) => {
        const path = event.state ? event.state.path : '/';
        renderView(path);
    });

    document.addEventListener('click', (event) => {
        if (event.target.tagName === '') {
            event.preventDefault();
            const path = event.target.getAttribute('href');
            handleNavigation(path);
        }
    });

    // Initial load
    const initialPath = window.location.pathname;
    handleNavigation(initialPath);
});
