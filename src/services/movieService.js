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

/**
 * Cung cap hinh nen (Backdrop) do phan giai cao (4K/HD) cho Hero Banner va Movie Detail
 * Giup hinh nen khong bi vo hat, mo hay lem khi phong to toan man hinh.
 */
export const getMovieBackdrop = (movie) => {
  if (!movie) return "/images/backdrops/action-backdrop.jpg";

  // 1. Neu phim da co san link backdrop ngang chat luong cao
  if (movie.backdrop && typeof movie.backdrop === "string" && movie.backdrop.trim()) {
    return movie.backdrop;
  }

  const title = (movie.title || "").toLowerCase();
  const genre = (movie.genre || "").toLowerCase();

  // 2. Venom 1, 3, 4 (Phim noi bat nhat trong anh cua user)
  if (title.includes("venom")) {
    return "/images/backdrops/venom-backdrop.jpg";
  }

  // 3. Marvel / Avengers / Spider-Man / Thor / Iron Man
  if (
    title.includes("avenger") ||
    title.includes("marvel") ||
    title.includes("iron") ||
    title.includes("thor") ||
    title.includes("captain") ||
    title.includes("người nhện") ||
    title.includes("spider") ||
    title.includes("wanda")
  ) {
    return "/images/backdrops/marvel-backdrop.jpg";
  }

  // 4. Phim Vien tuong / Sci-Fi / Star Wars
  if (
    title.includes("star wars") ||
    genre.includes("sci-fi") ||
    genre.includes("viễn tưởng") ||
    genre.includes("khoa học")
  ) {
    return "/images/backdrops/scifi-backdrop.jpg";
  }

  // 5. Phim Hoat hinh / Anime / Masha / Doraemon / Conan
  if (
    title.includes("masha") ||
    title.includes("doraemon") ||
    title.includes("conan") ||
    title.includes("pokemon") ||
    genre.includes("animation") ||
    genre.includes("hoạt hình") ||
    genre.includes("anime")
  ) {
    return "/images/backdrops/animation-backdrop.jpg";
  }

  // 6. Phim Lang man / Tinh cam / Romance
  if (
    title.includes("hạ cánh") ||
    genre.includes("romance") ||
    genre.includes("lãng mạn") ||
    genre.includes("tình cảm") ||
    genre.includes("ngôn tình")
  ) {
    return "/images/backdrops/romance-backdrop.jpg";
  }

  // 7. Phim Hanh dong / Mac dinh
  if (genre.includes("action") || genre.includes("hành động")) {
    return "/images/backdrops/action-backdrop.jpg";
  }

  // Neu anh san co la anh ngang chat luong tot
  if (movie.image && (movie.image.includes("marvel.jpg") || movie.image.includes("marvel1.jpg"))) {
    return movie.image;
  }

  return "/images/backdrops/action-backdrop.jpg";
};

