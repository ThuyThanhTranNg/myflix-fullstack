const API_BASE = process.env.REACT_APP_API_URL || "https://myflix-backend-latest.onrender.com/api";
const API_URL = `${API_BASE}/movies`;

export const getMovies = async () => {
  const res = await fetch(API_URL);
  return await res.json();
};

export const getMovie = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  return await res.json();
};

export const deleteMovie = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};

export const updateMovie = async (movie) => {
  const res = await fetch(`${API_URL}/${movie.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie)
  });
  return await res.json();
};

export const addMovie = async (movie) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie)
  });
  return await res.json();
};
