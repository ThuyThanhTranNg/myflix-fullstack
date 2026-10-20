require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Movie = require('./models/Movie');
let seedMoviesData = require('./seedData');

let inMemoryMovies = [...seedMoviesData];
let inMemoryUsers = [];

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// MongoDB Connection URI: hỗ trợ MONGO_URI, MONGODB_URI hoặc fallback localhost
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/myflix_db';

let isMongoConnected = false;

// Hàm tự động seed dữ liệu mẫu vào MongoDB nếu database còn trống
async function autoSeed() {
  try {
    const count = await Movie.countDocuments();
    if (count === 0) {
      console.log('🌱 Database MongoDB chưa có phim, đang tự động nạp (seed) dữ liệu ban đầu...');
      await Movie.insertMany(seedMoviesData);
      console.log(`✅ Đã nạp thành công ${seedMoviesData.length} bộ phim vào MongoDB collection 'movies'!`);
    } else {
      console.log(`ℹ️ MongoDB đã có sẵn ${count} bộ phim.`);
    }

    // Tạo sẵn tài khoản Admin nếu chưa có
    const adminExists = await User.findOne({ email: 'admin123@gmail.com' });
    if (!adminExists) {
      await User.create({
        firstName: 'System',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin123@gmail.com',
        password: 'admin123',
        gender: 'Other',
        isAdmin: true,
      });
      console.log("👤 Đã khởi tạo tài khoản Admin mặc định: admin123@gmail.com / admin123");
    }
  } catch (error) {
    console.error('⚠️ Lỗi khi tự động seed dữ liệu:', error.message);
  }
}

// Kết nối MongoDB
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    isMongoConnected = true;
    console.log(`🚀 Kết nối Database MongoDB thành công tới: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    autoSeed();
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn(
      `⚠️ Không thể kết nối MongoDB (${err.message}). Hệ thống tự động kích hoạt chế độ In-Memory Fallback.`
    );
  });

// ================= HEALTH CHECK =================
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'connected (MongoDB)' : 'fallback (In-Memory)',
    timestamp: new Date().toISOString(),
  });
});

// ================= API ĐĂNG KÝ (Hỗ trợ cả /api/register và /register) =================
app.post(['/api/register', '/register'], async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, gender } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ username, email và password.' });
    }

    if (isMongoConnected) {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email hoặc Tên đăng nhập đã được sử dụng.' });
      }

      const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password,
        gender,
        isAdmin: false,
      });
      await newUser.save();
      return res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
    }

    // In-memory fallback
    const exists = inMemoryUsers.some(
      (u) => u.email === email || u.username === username
    );
    if (exists) {
      return res.status(400).json({ message: 'Email hoặc Tên đăng nhập đã tồn tại.' });
    }

    const newUser = {
      id: inMemoryUsers.length + 1,
      firstName,
      lastName,
      username,
      email,
      password,
      gender,
      isAdmin: false,
    };
    inMemoryUsers.push(newUser);
    return res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ================= API ĐĂNG NHẬP (Hỗ trợ cả /api/login và /login) =================
app.post(['/api/login', '/login'], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcode fallback cho tài khoản admin
    if (email === 'admin123@gmail.com' && password === 'admin123') {
      return res.json({
        user: { username: 'Admin', email, isAdmin: true },
      });
    }

    if (isMongoConnected) {
      const user = await User.findOne({
        email: email ? email.toLowerCase() : '',
        password,
      });
      if (user) {
        return res.json({ user });
      }
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu.' });
    }

    // In-memory fallback
    const user = inMemoryUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      return res.json({ user });
    }
    return res.status(401).json({ message: 'Sai email hoặc mật khẩu.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ================= API QUẢN LÝ PHIM =================

// 1. Lấy toàn bộ danh sách phim (Hỗ trợ cả /api/movies và /movies)
app.get(['/api/movies', '/movies'], async (req, res) => {
  try {
    if (isMongoConnected) {
      const movies = await Movie.find().sort({ id: 1, createdAt: 1 });
      if (movies && movies.length > 0) {
        return res.json(movies);
      }
    }
    res.json(inMemoryMovies);
  } catch (error) {
    res.json(inMemoryMovies);
  }
});

// 1.5. Lấy chi tiết 1 phim (Tìm theo cả numeric id hoặc MongoDB _id)
app.get(['/api/movies/:id', '/movies/:id'], async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isMongoConnected) {
      const movie = await Movie.findByAnyId(paramId);
      if (movie) return res.json(movie);
    }
    const movie = inMemoryMovies.find(
      (m) => String(m.id) === String(paramId) || String(m._id) === String(paramId)
    );
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// 2. Thêm phim mới
app.post(['/api/movies', '/movies'], async (req, res) => {
  try {
    if (isMongoConnected) {
      let nextId = req.body.id;
      if (!nextId) {
        const lastMovie = await Movie.findOne().sort({ id: -1 });
        nextId = (lastMovie && lastMovie.id ? lastMovie.id : 0) + 1;
      }
      const newMovie = new Movie({
        ...req.body,
        id: nextId,
      });
      await newMovie.save();
      return res.status(201).json(newMovie);
    }

    const newMovie = { id: Date.now(), ...req.body };
    inMemoryMovies.push(newMovie);
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// 3. Sửa phim
app.put(['/api/movies/:id', '/movies/:id'], async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isMongoConnected) {
      const movie = await Movie.findByAnyId(paramId);
      if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });

      Object.assign(movie, req.body);
      const updatedMovie = await movie.save();
      return res.json(updatedMovie);
    }

    const index = inMemoryMovies.findIndex(
      (m) => String(m.id) === String(paramId) || String(m._id) === String(paramId)
    );
    if (index === -1) return res.status(404).json({ message: 'Không tìm thấy phim' });
    inMemoryMovies[index] = { ...inMemoryMovies[index], ...req.body };
    res.json(inMemoryMovies[index]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// 4. Xóa phim
app.delete(['/api/movies/:id', '/movies/:id'], async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isMongoConnected) {
      const movie = await Movie.findByAnyId(paramId);
      if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });

      await Movie.deleteOne({ _id: movie._id });
      return res.json({ message: 'Xóa thành công' });
    }

    inMemoryMovies = inMemoryMovies.filter(
      (m) => String(m.id) !== String(paramId) && String(m._id) !== String(paramId)
    );
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ================= API SEED DỮ LIỆU THỦ CÔNG =================
app.get(['/api/seed', '/seed'], async (req, res) => {
  try {
    if (isMongoConnected) {
      const count = await Movie.countDocuments();
      if (count > 0 && req.query.force !== 'true') {
        return res.json({
          message: `Database đã có ${count} bộ phim. Thêm '?force=true' nếu muốn reset và seed lại.`,
        });
      }

      if (req.query.force === 'true') {
        await Movie.deleteMany({});
      }

      await Movie.insertMany(seedMoviesData);
      return res.json({
        message: `Đã seed thành công ${seedMoviesData.length} bộ phim vào MongoDB collection 'movies'!`,
      });
    }

    inMemoryMovies = [...seedMoviesData];
    res.json({
      message: `Đã reset và seed thành công ${inMemoryMovies.length} bộ phim trong bộ nhớ!`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi seed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
