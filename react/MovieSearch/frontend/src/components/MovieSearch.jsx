import { useState } from "react";


function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");

  // Fetch movies from OMDb API
  const searchMovies = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a movie name");
      return;
    }
    setError("");
    setMovies([]);

    try {
      const res = await fetch(`https://www.omdbapi.com/?apikey=564727fa&s=${query}`);
      const data = await res.json();

      if (data.Response === "True") {
        setMovies(data.Search);
      } else {
        setError("No movies found!");
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  return (
    <div className="container">
      <h2>🎥 Movie Search</h2>

      <form onSubmit={searchMovies}>
        <label>Enter Movie Name:</label>
        <input
          type="text"
          placeholder="e.g. Avengers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-card">
            <img
              src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150"}
              alt={movie.Title}
            />
            <h3>{movie.Title}</h3>
            <p>{movie.Year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieSearch;
