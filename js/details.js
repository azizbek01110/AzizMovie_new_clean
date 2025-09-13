document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const kinoContent = JSON.parse(localStorage.getItem('kinoContent')) || [];
    const content = kinoContent.find(item => item.id === contentId);

    if (!content) {
        document.querySelector('main').innerHTML = '<h1>Content Not Found</h1>';
        return;
    }

    document.getElementById('content-title').textContent = content.title;
    document.getElementById('content-description').textContent = content.description;

    const videoPlayerContainer = document.querySelector('.video-player-container');
    const videoPlayer = document.getElementById('video-player');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const closePlayerBtn = document.getElementById('close-player-btn');
    const seriesEpisodesDiv = document.getElementById('series-episodes');
    const episodeList = document.getElementById('episode-list');

    if (content.isSeries) {
        seriesEpisodesDiv.style.display = 'block';
        if (content.episodes && content.episodes.length > 0) {
            // Play the first episode by default
            videoPlayer.src = content.episodes[0].url;

            content.episodes.forEach((episode, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>Episode ${index + 1}: ${episode.title}</span>
                    <button data-url="${episode.url}">Play Episode</button>
                `;
                episodeList.appendChild(listItem);

                listItem.querySelector('button').addEventListener('click', (e) => {
                    videoPlayer.src = e.target.dataset.url;
                    videoPlayer.play();
                });
            });
        }
    } else {
        videoPlayer.src = content.videoUrl;
    }

    // Fullscreen button functionality
    fullscreenBtn.addEventListener('click', () => {
        if (videoPlayerContainer.requestFullscreen) {
            videoPlayerContainer.requestFullscreen();
        } else if (videoPlayerContainer.mozRequestFullScreen) { /* Firefox */
            videoPlayerContainer.mozRequestFullScreen();
        } else if (videoPlayerContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            videoPlayerContainer.webkitRequestFullscreen();
        } else if (videoPlayerContainer.msRequestFullscreen) { /* IE/Edge */
            videoPlayerContainer.msRequestFullscreen();
        }
    });

    // Exit fullscreen when escape is pressed (or other methods)
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            videoPlayerContainer.classList.add('video-player-fullscreen');
        } else {
            videoPlayerContainer.classList.remove('video-player-fullscreen');
        }
    });
    document.addEventListener('webkitfullscreenchange', () => {
        if (document.webkitFullscreenElement) {
            videoPlayerContainer.classList.add('video-player-fullscreen');
        } else {
            videoPlayerContainer.classList.remove('video-player-fullscreen');
        }
    });
    document.addEventListener('mozfullscreenchange', () => {
        if (document.mozFullScreenElement) {
            videoPlayerContainer.classList.add('video-player-fullscreen');
        } else {
            videoPlayerContainer.classList.remove('video-player-fullscreen');
        }
    });
    document.addEventListener('msfullscreenchange', () => {
        if (document.msFullscreenElement) {
            videoPlayerContainer.classList.add('video-player-fullscreen');
        } else {
            videoPlayerContainer.classList.remove('video-player-fullscreen');
        }
    });

    // Close player button functionality
    closePlayerBtn.addEventListener('click', () => {
        // Stop the video and navigate back to the home page
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        window.location.href = 'index.html';
    });
});