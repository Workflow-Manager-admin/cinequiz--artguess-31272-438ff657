//
/*
TMDb API utility for CineQuiz & ArtGuess

Centralizes movie/actor/poster calls for all quiz features (actor-based, poster-based, language selection, etc.).
Integrates the TMDb API key directly within this file (as requested)—no reliance on environment variables.
*/

// PUBLIC_INTERFACE
/**
 * All TMDb API calls go through this utility.
 * 
 * Usage:
 *   import tmdbApi from './tmdbApi';
 *   const movie = await tmdbApi.getMovieById(id, 'en');
 */
const tmdbApi = (() => {
  // === TMDb API KEY IS INCLUDED BELOW (for demo/educational use) ===
  // WARNING: This exposes the API key to the client and is NOT recommended for production.
  // Replace this with your actual TMDb API key:
  const API_KEY = "REPLACE_THIS_WITH_YOUR_TMDB_KEY"; // <-- Put your TMDb v3 API key here as a string

  // Fail clearly if key not present (for dev clarity)
  if (!API_KEY || API_KEY === "REPLACE_THIS_WITH_YOUR_TMDB_KEY") {
    throw new Error(
      "TMDb API key is not set! Please provide your actual TMDb API key in src/tmdbApi.js"
    );
  }

  const BASE_URL = 'https://api.themoviedb.org/3';

  // Generic fetch wrapper for API
  async function apiFetch(endpoint, params = {}) {
    // Always include 'api_key' and handle language
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    // Support language selection (default 'en', or 'ta' for Tamil)
    if (params.language) {
      url.searchParams.append('language', params.language);
      delete params.language;
    }
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`TMDb API error: ${resp.status} - ${resp.statusText}`);
    }
    return await resp.json();
  }

  // PUBLIC_INTERFACE
  /**
   * Fetch a movie object by ID
   */
  async function getMovieById(movieId, language = 'en') {
    return await apiFetch(`/movie/${movieId}`, { language });
  }

  // PUBLIC_INTERFACE
  /**
   * Fetch cast & crew for a movie (used in Actor-based quiz)
   */
  async function getMovieCredits(movieId, language = 'en') {
    // TMDb /movie/{id}/credits does not fully honor language param but attach anyway
    return await apiFetch(`/movie/${movieId}/credits`, { language });
  }

  // PUBLIC_INTERFACE
  /**
   * Fetch posters for a movie (used in poster-based guess)
   */
  async function getMoviePosters(movieId, language = 'en') {
    // /images endpoint, filter for posters
    const images = await apiFetch(`/movie/${movieId}/images`, { include_image_language: `${language},null` });
    // Only posters — return array
    return images.posters || [];
  }

  // PUBLIC_INTERFACE
  /**
   * Search for movies by title (for quiz randomization, admin, AI drawing, etc.)
   */
  async function searchMovies(query, language = 'en', page = 1) {
    return await apiFetch(`/search/movie`, {
      query,
      language,
      page
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Get info for a given person (actor) by ID
   */
  async function getPersonById(personId, language = 'en') {
    return await apiFetch(`/person/${personId}`, { language });
  }

  // PUBLIC_INTERFACE
  /**
   * Discover movies for quiz randomization.
   * Use genre, year, language etc as needed. Callers choose criteria.
   */
  async function discoverMovies(params = {}) {
    return await apiFetch(`/discover/movie`, params);
  }

  // PUBLIC_INTERFACE
  /**
   * Helper: Get full poster URL (TMDb returns only relative paths)
   */
  function getPosterUrl(posterPath, size = 'w342') {
    // size: w92, w154, w185, w342, w500, w780, original
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  return {
    getMovieById,
    getMovieCredits,
    getMoviePosters,
    getPosterUrl,
    searchMovies,
    getPersonById,
    discoverMovies,
  };
})();

export default tmdbApi;

/**
 * ========== SAMPLE USAGE FOR TMDb API ==========
 * These are examples for your reference—remove or use as developer guides.
 * 
 * import tmdbApi from './tmdbApi';
 * 
 * // 1. Get basic info for a movie by TMDb movie ID (e.g., "550" = Fight Club)
 * tmdbApi.getMovieById(550).then(console.log);
 * 
 * // 2. Get cast/crew for a movie
 * tmdbApi.getMovieCredits(550).then(console.log);
 * 
 * // 3. Get all available posters for a movie
 * tmdbApi.getMoviePosters(550).then(posters => {
 *    if (posters.length > 0) {
 *       const fullPosterUrl = tmdbApi.getPosterUrl(posters[0].file_path);
 *       console.log(fullPosterUrl);
 *    }
 * });
 * 
 * // 4. Search for movies by title
 * tmdbApi.searchMovies("Inception").then(data => console.log(data.results));
 * 
 * // 5. Get actor info by person ID (e.g., Brad Pitt = 287)
 * tmdbApi.getPersonById(287).then(console.log);
 * 
 * // 6. Use with language option (Tamil, "ta")
 * tmdbApi.getMovieById(550, "ta").then(console.log);
 */
