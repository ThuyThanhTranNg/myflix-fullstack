require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DataSource } = require('typeorm');
const UserSchema = require('./entities/User');
const MovieSchema = require('./entities/Movie');
let moviesStore = [...require('./seedData')];
let inMemoryUsers = [];

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Cấu hình kết nối SQL Server (MSSQL)
const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "Sa@123456",
    database: process.env.DB_NAME || "myflix_db",
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE || "THANHTHUY",
    },
    synchronize: true,
    logging: false,
    entities: [UserSchema, MovieSchema],
});

// Chỉ cố gắng kết nối DB nếu có cấu hình DB_HOST hoặc chạy local
if (process.env.DB_HOST && process.env.DB_HOST !== "localhost") {
  AppDataSource.initialize()
      .then(() => {
          console.log("🚀 Kết nối Database SQL Server thành công!");
      })
      .catch((err) => {
          console.warn("⚠️ Không thể kết nối Database Cloud. Hệ thống tự động chuyển sang chế độ Mock Data:", err.message);
      });
} else {
  // Thử kết nối local nếu không chạy trên Cloud Render
  AppDataSource.initialize()
      .then(() => {
          console.log("🚀 Kết nối Database Local thành công!");
      })
      .catch((err) => {
          console.log("ℹ️ Đang chạy chế độ In-Memory Fallback (Đăng ký/Đăng nhập/Quản lý phim sẵn sàng).");
      });
}

// ================= API ĐĂNG KÝ =================
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, gender } = req.body;

    if (AppDataSource.isInitialized) {
      const userRepository = AppDataSource.getRepository("User");
      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được đăng ký." });
      }

      const newUser = userRepository.create({
        firstName, lastName, username, email, password, gender
      });
      await userRepository.save(newUser);
      return res.status(201).json({ message: "Đăng ký thành công!" });
    }

    // In-memory fallback
    const exists = inMemoryUsers.some(u => u.email === email || u.username === username);
    if (exists) {
      return res.status(400).json({ message: "Email hoặc Tên đăng nhập đã tồn tại." });
    }

    const newUser = {
      id: inMemoryUsers.length + 1,
      firstName,
      lastName,
      username,
      email,
      password,
      gender,
      isAdmin: false
    };
    inMemoryUsers.push(newUser);
    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ================= API ĐĂNG NHẬP =================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcode cho tài khoản admin
    if (email === "admin123@gmail.com" && password === "admin123") {
      return res.json({ 
        user: { username: "Admin", email, isAdmin: true } 
      });
    }

    if (AppDataSource.isInitialized) {
      const userRepository = AppDataSource.getRepository("User");
      const user = await userRepository.findOneBy({ email, password });
      if (user) {
        return res.json({ user });
      }
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }

    // In-memory fallback
    const user = inMemoryUsers.find(u => u.email === email && u.password === password);
    if (user) {
      return res.json({ user });
    }
    return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ================= API QUẢN LÝ PHIM =================

// 1. Lấy toàn bộ danh sách phim
app.get('/api/movies', async (req, res) => {
  try {
    if (AppDataSource.isInitialized) {
      const movieRepository = AppDataSource.getRepository("Movie");
      const movies = await movieRepository.find();
      if (movies && movies.length > 0) {
        return res.json(movies);
      }
    }
    res.json(moviesStore);
  } catch (error) {
    res.json(moviesStore);
  }
});

// 1.5. Lấy chi tiết 1 phim
app.get('/api/movies/:id', async (req, res) => {
  try {
    if (AppDataSource.isInitialized) {
      const movieRepository = AppDataSource.getRepository("Movie");
      const movie = await movieRepository.findOneBy({ id: Number(req.params.id) });
      if (movie) return res.json(movie);
    }
    const movie = moviesStore.find(m => m.id === Number(req.params.id));
    if (!movie) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 2. Thêm phim mới
app.post('/api/movies', async (req, res) => {
  try {
    if (AppDataSource.isInitialized) {
      const movieRepository = AppDataSource.getRepository("Movie");
      const newMovie = movieRepository.create(req.body);
      await movieRepository.save(newMovie);
      return res.status(201).json(newMovie);
    }
    const newMovie = { id: Date.now(), ...req.body };
    moviesStore.push(newMovie);
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 3. Sửa phim
app.put('/api/movies/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (AppDataSource.isInitialized) {
      const movieRepository = AppDataSource.getRepository("Movie");
      const movie = await movieRepository.findOneBy({ id });
      if (!movie) return res.status(404).json({ message: "Không tìm thấy phim" });

      movieRepository.merge(movie, req.body);
      const updatedMovie = await movieRepository.save(movie);
      return res.json(updatedMovie);
    }
    const index = moviesStore.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy phim" });
    moviesStore[index] = { ...moviesStore[index], ...req.body };
    res.json(moviesStore[index]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 4. Xóa phim
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (AppDataSource.isInitialized) {
      const movieRepository = AppDataSource.getRepository("Movie");
      const result = await movieRepository.delete(id);
      if (result.affected === 0) return res.status(404).json({ message: "Không tìm thấy phim" });
      return res.json({ message: "Xóa thành công" });
    }
    moviesStore = moviesStore.filter(m => m.id !== id);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ================= API SEED DỮ LIỆU =================
app.get('/api/seed', async (req, res) => {
  try {
    const moviesData = require('./seedData');
    if (AppDataSource.isInitialized) {
      const movieRepository = AppDataSource.getRepository("Movie");
      const count = await movieRepository.count();
      if (count > 0) {
        return res.json({ message: "Database đã có dữ liệu, không cần seed nữa." });
      }

      const newMovies = movieRepository.create(moviesData.map(m => {
        const { id, ...movieWithoutId } = m;
        return movieWithoutId;
      }));
      await movieRepository.save(newMovies);
      return res.json({ message: `Đã seed thành công ${newMovies.length} bộ phim vào Database!` });
    }
    moviesStore = [...moviesData];
    res.json({ message: `Đã reset và seed thành công ${moviesStore.length} bộ phim trong bộ nhớ!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi seed", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
