const apiKey = '89636d08d9aae369dd2bf9a10eb435e9'; // Replace with your TMDb API key

document.addEventListener('DOMContentLoaded', async () => {
    const genreSelect = document.getElementById('genre');
    const excludeGenreSelect = document.getElementById('exclude-genre');
    
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
        if (!response.ok) throw new Error('Failed to fetch genres');
        const data = await response.json();
        const genres = data.genres;
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
            const excludeOption = option.cloneNode(true);
            excludeGenreSelect.appendChild(excludeOption);
        });
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
});

function trackButtonClick() {
    gtag('event', 'click', {
        'event_category': 'Button',
        'event_label': 'Get Random Movie'
    });
}

async function generateMovie() {
    trackButtonClick(); // Track the button click

    const loadingElement = document.getElementById("loading");
    const movieDetailsElement = document.getElementById("movie-details");
    loadingElement.style.display = "block";
    movieDetailsElement.style.display = "none";

    try {
        const minRating = parseFloat(document.getElementById("min-rating").value);
        const genreSelect = document.getElementById("genre");
        const excludeGenreSelect = document.getElementById("exclude-genre");
        const selectedGenres = Array.from(genreSelect.selectedOptions).map(option => option.value);
        const excludedGenres = Array.from(excludeGenreSelect.selectedOptions).map(option => option.value);
        let movie;

        while (true) {
            const randomPage = Math.floor(Math.random() * 500) + 1;
            let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${randomPage}`;
            if (selectedGenres.length > 0) {
                url += `&with_genres=${selectedGenres.join(',')}`;
            }
            if (excludedGenres.length > 0) {
                url += `&without_genres=${excludedGenres.join(',')}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch movies');
            const data = await response.json();
            const movies = data.results;
            if (movies.length === 0) throw new Error('No movies found');
            const randomIndex = Math.floor(Math.random() * movies.length);
            movie = movies[randomIndex];

            if (movie.vote_average >= minRating) {
                break;
            }
        }

        const movieDetails = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits`);
        if (!movieDetails.ok) throw new Error('Failed to fetch movie details');
        const details = await movieDetails.json();

        document.getElementById("movie-poster").src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        document.getElementById("movie-title").textContent = details.title;
        document.getElementById("movie-story").textContent = details.overview;
        document.getElementById("movie-rating").textContent = `Rating: ${details.vote_average}`;
        document.getElementById("movie-genre").textContent = `Genre: ${details.genres.map(genre => genre.name).join(', ')}`;
        document.getElementById("movie-release").textContent = `Release Date: ${details.release_date}`;
        document.getElementById("movie-director").textContent = `Director: ${details.credits.crew.find(person => person.job === 'Director').name}`;
        document.getElementById("movie-cast").textContent = `Cast: ${details.credits.cast.slice(0, 5).map(actor => actor.name).join(', ')}`;

        movieDetailsElement.style.display = "block";
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    } finally {
        loadingElement.style.display = "none";
    }

    // Ensure movie poster and title are visible
    const movieDetails = document.getElementById("movie-details");
    const posterElement = document.getElementById("movie-poster");
    const titleElement = document.getElementById("movie-title");

    // Scroll to the movie details section
    movieDetails.scrollIntoView({ behavior: "smooth", block: "start" });

    // Adjust scroll to make sure both poster and title are visible
    setTimeout(() => {
        const posterRect = posterElement.getBoundingClientRect();
        const titleRect = titleElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Check if both elements are in view
        if (posterRect.top < 0 || posterRect.bottom > windowHeight || titleRect.top < 0 || titleRect.bottom > windowHeight) {
            window.scrollBy({
                top: Math.min(
                    Math.max(posterRect.top + window.scrollY - 10, 0),
                    document.body.scrollHeight - windowHeight
                ),
                behavior: "smooth"
            });
        }
    }, 500); // Adjust the timeout if needed
}
