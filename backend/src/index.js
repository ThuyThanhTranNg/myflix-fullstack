require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DataSource } = require('typeorm');
const UserSchema = require('./entities/User');
const MovieSchema = require('./entities/Movie');

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
    synchronize: true, // Tự động tạo và đồng bộ bảng dựa theo User.js và Movie.js
    logging: false,
    entities: [UserSchema, MovieSchema],
});

AppDataSource.initialize()
    .then(() => {
        console.log("🚀 Kết nối Database SQL Server thành công!");
    })
    .catch((err) => {
        console.error("❌ Lỗi kết nối Database:", err);
    });

// ================= API ĐĂNG KÝ =================
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, gender } = req.body;
    const userRepository = AppDataSource.getRepository("User");
    
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký." });
    }

    const newUser = userRepository.create({
      firstName, lastName, username, email, password, gender
    });
    
    await userRepository.save(newUser);
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ================= API ĐĂNG NHẬP =================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcode cho tài khoản admin (giữ nguyên logic cũ của bạn)
    if (email === "admin123@gmail.com" && password === "admin123") {
      return res.json({ 
        user: { username: "Admin", email, isAdmin: true } 
      });
    }

    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ email, password });
    
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ message: "Sai email hoặc mật khẩu." });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ================= API QUẢN LÝ PHIM =================

// 1. Lấy toàn bộ danh sách phim
app.get('/api/movies', async (req, res) => {
  try {
    const movieRepository = AppDataSource.getRepository("Movie");
    const movies = await movieRepository.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 1.5. Lấy chi tiết 1 phim
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movieRepository = AppDataSource.getRepository("Movie");
    const movie = await movieRepository.findOneBy({ id: Number(req.params.id) });
    if (!movie) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 2. Thêm phim mới
app.post('/api/movies', async (req, res) => {
  try {
    const movieRepository = AppDataSource.getRepository("Movie");
    const newMovie = movieRepository.create(req.body);
    await movieRepository.save(newMovie);
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 3. Sửa phim
app.put('/api/movies/:id', async (req, res) => {
  try {
    const movieRepository = AppDataSource.getRepository("Movie");
    const movie = await movieRepository.findOneBy({ id: Number(req.params.id) });
    if (!movie) return res.status(404).json({ message: "Không tìm thấy phim" });

    movieRepository.merge(movie, req.body);
    const updatedMovie = await movieRepository.save(movie);
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// 4. Xóa phim
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const movieRepository = AppDataSource.getRepository("Movie");
    const result = await movieRepository.delete(Number(req.params.id));
    if (result.affected === 0) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ================= API SEED DỮ LIỆU =================
app.get('/api/seed', async (req, res) => {
  try {
    const moviesData = require('./seedData');
    const movieRepository = AppDataSource.getRepository("Movie");
    
    // Kiểm tra xem database đã có phim chưa
    const count = await movieRepository.count();
    if (count > 0) {
      return res.json({ message: "Database đã có dữ liệu, không cần seed nữa." });
    }

    // Nếu chưa có, thêm toàn bộ dữ liệu vào SQL Server
    const newMovies = movieRepository.create(moviesData.map(m => {
      const { id, ...movieWithoutId } = m;
      return movieWithoutId;
    }));
    await movieRepository.save(newMovies);
    
    res.json({ message: `Đã seed thành công ${newMovies.length} bộ phim vào Database!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi seed", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
