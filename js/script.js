document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const movieGrid = document.getElementById('movie-grid');

    const preloader = document.getElementById('preloader');

    // Hide preloader when everything is loaded
    window.addEventListener('load', () => {
        if (preloader) {
            preloader.classList.add('hidden');
            // Remove preloader from DOM after transition to prevent interaction issues
            preloader.addEventListener('transitionend', () => {
                preloader.remove();
            });
        }
    });

    let kinoContent = [];
    try {
        kinoContent = JSON.parse(localStorage.getItem('kinoContent')) || [];
    } catch (e) {
        console.error("Error parsing kinoContent from localStorage:", e);
        kinoContent = [];
    }

    // Function to render movie/series cards
    function renderContent(filteredContent = kinoContent) {
        movieGrid.innerHTML = ''; // Clear existing content

        if (filteredContent.length === 0) {
            movieGrid.innerHTML = '<p style="text-align: center; width: 100%;">No content found.</p>';
            return;
        }

        filteredContent.forEach(item => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            movieCard.innerHTML = `
                <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="${item.title}">
                <div class="movie-card-info">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    ${item.isSeries ? '<p>Series</p>' : '<p>Movie</p>'}
                    <button class="play-button" data-id="${item.id}">Play</button>
                </div>
            `;
            movieGrid.appendChild(movieCard);
        });

        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const contentId = e.target.dataset.id;
                window.location.href = `details.html?id=${contentId}`;
            });
        });
    }

    // Search functionality
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredContent = kinoContent.filter(item => 
            item.title.toLowerCase().includes(searchTerm)
        );
        renderContent(filteredContent);
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    renderContent(); // Initial render of all content
});