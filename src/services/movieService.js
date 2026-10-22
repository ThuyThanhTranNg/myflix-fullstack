import { getApiBase } from "./apiConfig";

const getMoviesUrl = () => `${getApiBase()}/movies`;

export const getMovies = async () => {
  const res = await fetch(getMoviesUrl());
  return await res.json();
};

export const getMovie = async (id) => {
  const res = await fetch(`${getMoviesUrl()}/${id}`);
  return await res.json();
};

export const deleteMovie = async (id) => {
  await fetch(`${getMoviesUrl()}/${id}`, { method: 'DELETE' });
};

export const updateMovie = async (movie) => {
  const res = await fetch(`${getMoviesUrl()}/${movie.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie)
  });
  return await res.json();
};

export const addMovie = async (movie) => {
  const res = await fetch(getMoviesUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie)
  });
  return await res.json();
};
