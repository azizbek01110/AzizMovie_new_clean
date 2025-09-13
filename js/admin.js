document.addEventListener('DOMContentLoaded', () => {
    const adminPasswordInput = document.getElementById('admin-password');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');
    const adminContentDiv = document.getElementById('admin-content');
    const addMovieForm = document.getElementById('add-movie-form');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const imageUrlInput = document.getElementById('imageUrl');
    const videoUrlInput = document.getElementById('videoUrl');
    const isSeriesCheckbox = document.getElementById('isSeries');
    const episodeFieldsDiv = document.getElementById('episode-fields');
    const addEpisodeButton = document.getElementById('add-episode');
    const episodesContainer = document.getElementById('episodes-container');
    const contentList = document.getElementById('content-list');
    const logoutButton = document.getElementById('logout-button');

    const ADMIN_PASSWORD = "12344321";

    let kinoContent = [];
    try {
        kinoContent = JSON.parse(localStorage.getItem('kinoContent')) || [];
    } catch (e) {
        console.error("Error parsing kinoContent from localStorage:", e);
        kinoContent = []; // Reset if corrupted
    }

    function renderContentList() {
        contentList.innerHTML = '';
        kinoContent.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${item.title} ${item.isSeries ? '(Series)' : '(Movie)'}</span>
                <div>
                    <button data-index="${index}" class="edit-button">Edit</button>
                    <button data-index="${index}" class="delete-button">Delete</button>
                </div>
            `;
            contentList.appendChild(listItem);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                kinoContent.splice(index, 1);
                localStorage.setItem('kinoContent', JSON.stringify(kinoContent));
                renderContentList();
            });
        });
        // Edit functionality to be implemented later if needed, for now just delete
    }

    function showAdminPanel() {
        document.getElementById('login-form').style.display = 'none';
        adminContentDiv.style.display = 'block';
        renderContentList();
    }

    function hideAdminPanel() {
        document.getElementById('login-form').style.display = 'block';
        adminContentDiv.style.display = 'none';
        adminPasswordInput.value = '';
        loginMessage.textContent = '';
    }

    loginButton.addEventListener('click', () => {
        if (adminPasswordInput.value === ADMIN_PASSWORD) {
            showAdminPanel();
        } else {
            loginMessage.textContent = 'Incorrect password.';
        }
    });

    logoutButton.addEventListener('click', () => {
        hideAdminPanel();
    });

    isSeriesCheckbox.addEventListener('change', () => {
        if (isSeriesCheckbox.checked) {
            episodeFieldsDiv.style.display = 'block';
        } else {
            episodeFieldsDiv.style.display = 'none';
            episodesContainer.innerHTML = ''; // Clear episodes when not a series
        }
    });

    addEpisodeButton.addEventListener('click', () => {
        const episodeCount = episodesContainer.children.length + 1;
        const episodeDiv = document.createElement('div');
        episodeDiv.classList.add('episode-item');
        episodeDiv.innerHTML = `
            <label>Episode ${episodeCount} Title:</label>
            <input type="text" class="episode-title" placeholder="Episode Title">
            <label>Episode ${episodeCount} Video File:</label>
            <input type="file" class="episode-url" name="files" accept="video/*">
            <button type="button" class="remove-episode-button">Remove</button>
        `;
        episodesContainer.appendChild(episodeDiv);

        episodeDiv.querySelector('.remove-episode-button').addEventListener('click', (e) => {
            e.target.closest('.episode-item').remove();
            // Re-index episodes after removal (optional but good for display)
            Array.from(episodesContainer.children).forEach((el, idx) => {
                el.querySelector('label:nth-of-type(1)').textContent = `Episode ${idx + 1} Title:`;
                el.querySelector('label:nth-of-type(2)').textContent = `Episode ${idx + 1} URL:`;
            });
        });
    });

    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newContent = {
            id: Date.now().toString(), // Unique ID
            title: titleInput.value,
            description: descriptionInput.value,
            isSeries: isSeriesCheckbox.checked,
        };

        const imageFile = imageUrlInput.files[0];
        const videoFile = videoUrlInput.files[0];

        const uploadFiles = async (files) => {
            const formData = new FormData();
            files.forEach(file => {
                if (file) {
                    formData.append('files', file);
                }
            });

            if (files.filter(Boolean).length === 0) {
                return [];
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.urls;
        };

        try {
            const [imageUrl, videoUrl] = await uploadFiles([imageFile, videoFile]);
            newContent.imageUrl = imageUrl;
            newContent.videoUrl = videoUrl;

            if (isSeriesCheckbox.checked) {
                newContent.episodes = [];
                const episodeFilesToUpload = [];

                document.querySelectorAll('.episode-item').forEach(episodeDiv => {
                    const episodeTitle = episodeDiv.querySelector('.episode-title').value;
                    const episodeFile = episodeDiv.querySelector('.episode-url').files[0];

                    if (episodeTitle) {
                        // Temporarily store title and file together for processing after upload
                        episodeFilesToUpload.push({ title: episodeTitle, file: episodeFile });
                    }
                });

                const episodeUrls = await uploadFiles(episodeFilesToUpload.map(e => e.file));

                newContent.episodes = episodeFilesToUpload.map((episode, index) => ({
                    title: episode.title,
                    url: episodeUrls[index] || null,
                }));
            }

            kinoContent.push(newContent);
            localStorage.setItem('kinoContent', JSON.stringify(kinoContent));
            renderContentList();

            // Clear form
            addMovieForm.reset();
            episodesContainer.innerHTML = '';
            episodeFieldsDiv.style.display = 'none';
        } catch (error) {
            console.error('Error during file upload or content submission:', error);
            alert('Content qo\'shishda xatolik yuz berdi. Console-ni tekshiring.');
        }
    });

    // Check if already logged in (optional, could use session storage)
    // For now, it will always require login on page load.
});