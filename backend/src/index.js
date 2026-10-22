require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Comment = require('./models/Comment');
let seedMoviesData = require('./seedData');

let seedCommentsData = [
  {
    movieId: '1',
    movieTitle: 'Avengers',
    userName: 'Hoàng Long',
    userEmail: 'hoanglong@gmail.com',
    content: 'Phim xem cực kỳ mãn nhãn, kỹ xảo đỉnh cao! Đoạn cuối đánh nhau ở New York xem lại 10 lần vẫn cuốn.',
    rating: 5,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    movieId: '2',
    movieTitle: 'Venom',
    userName: 'Thu Thảo',
    userEmail: 'thuthao99@gmail.com',
    content: 'Tom Hardy diễn xuất xuất sắc, Venom nhìn ngầu đét mà nhiều đoạn hài hước cười xỉu.',
    rating: 5,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    movieId: '2',
    movieTitle: 'Venom',
    userName: 'Quảng Cáo Spam',
    userEmail: 'spammer888@tempmail.com',
    content: 'Truy cập ngay web cá cược xxx nhận 100k free không cần nạp tiền!!!',
    rating: 1,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    movieId: '3',
    movieTitle: 'Venom 3',
    userName: 'Đức Anh',
    userEmail: 'ducanh.dev@gmail.com',
    content: 'Âm thanh vòm Dolby trên web nghe đã tai lắm, mong admin cập nhật thêm nhiều phim Marvel nữa nhé!',
    rating: 5,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

let inMemoryMovies = [...seedMoviesData];
let inMemoryComments = [...seedCommentsData];
let inMemoryUsers = [
  {
    id: 1,
    firstName: 'System',
    lastName: 'Admin',
    username: 'admin',
    email: 'admin123@gmail.com',
    password: 'admin123',
    gender: 'Other',
    isAdmin: true,
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 2,
    firstName: 'Tuấn',
    lastName: 'Nguyễn',
    username: 'tuannguyen',
    email: 'tuan.nguyen@example.com',
    password: 'password123',
    gender: 'Male',
    isAdmin: false,
    createdAt: new Date('2026-02-15').toISOString(),
  },
  {
    id: 3,
    firstName: 'Linh',
    lastName: 'Trần',
    username: 'linhtran',
    email: 'linh.tran@example.com',
    password: 'password123',
    gender: 'Female',
    isAdmin: false,
    createdAt: new Date('2026-03-10').toISOString(),
  },
  {
    id: 4,
    firstName: 'Minh',
    lastName: 'Hoàng',
    username: 'minhhoang',
    email: 'minh.hoang@example.com',
    password: 'password123',
    gender: 'Male',
    isAdmin: false,
    createdAt: new Date('2026-04-05').toISOString(),
  },
];

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
        id: 1,
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

    const userCount = await User.countDocuments();
    if (userCount <= 1) {
      await User.insertMany([
        {
          id: 2,
          firstName: 'Tuấn',
          lastName: 'Nguyễn',
          username: 'tuannguyen',
          email: 'tuan.nguyen@example.com',
          password: 'password123',
          gender: 'Male',
          isAdmin: false,
        },
        {
          id: 3,
          firstName: 'Linh',
          lastName: 'Trần',
          username: 'linhtran',
          email: 'linh.tran@example.com',
          password: 'password123',
          gender: 'Female',
          isAdmin: false,
        },
        {
          id: 4,
          firstName: 'Minh',
          lastName: 'Hoàng',
          username: 'minhhoang',
          email: 'minh.hoang@example.com',
          password: 'password123',
          gender: 'Male',
          isAdmin: false,
        },
      ]);
      console.log("👥 Đã nạp thêm dữ liệu người dùng mẫu!");
    }

    const commentCount = await Comment.countDocuments();
    if (commentCount === 0) {
      await Comment.insertMany(seedCommentsData);
      console.log(`💬 Đã nạp thành công ${seedCommentsData.length} bình luận & đánh giá mẫu!`);
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

// ================= API QUÊN / ĐẶT LẠI MẬT KHẨU =================
app.post(['/api/reset-password', '/reset-password', '/api/forgot-password', '/forgot-password'], async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
      }
      user.password = newPassword;
      await user.save();
      return res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
    }

    // In-memory fallback
    const index = inMemoryUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (index === -1) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }
    inMemoryUsers[index].password = newPassword;
    return res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ================= API QUẢN LÝ NGƯỜI DÙNG (USERS) =================

// 1. Lấy danh sách toàn bộ người dùng
app.get(['/api/users', '/users'], async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
      return res.json(users);
    }
    const safeUsers = inMemoryUsers.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// 2. Cập nhật vai trò Admin/User của người dùng
app.put(['/api/users/:id/role', '/users/:id/role', '/api/users/:id', '/users/:id'], async (req, res) => {
  try {
    const paramId = req.params.id;
    const { isAdmin } = req.body;

    if (isMongoConnected) {
      const user = await User.findByAnyId(paramId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      user.isAdmin = typeof isAdmin === 'boolean' ? isAdmin : !user.isAdmin;
      await user.save();
      const userObj = user.toObject();
      delete userObj.password;
      return res.json({ message: 'Cập nhật vai trò thành công', user: userObj });
    }

    const index = inMemoryUsers.findIndex(
      (u) => String(u.id) === String(paramId) || String(u._id) === String(paramId)
    );
    if (index === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    inMemoryUsers[index].isAdmin =
      typeof isAdmin === 'boolean' ? isAdmin : !inMemoryUsers[index].isAdmin;
    const { password, ...safeUser } = inMemoryUsers[index];
    res.json({ message: 'Cập nhật vai trò thành công', user: safeUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// 3. Xóa người dùng
app.delete(['/api/users/:id', '/users/:id'], async (req, res) => {
  try {
    const paramId = req.params.id;

    if (isMongoConnected) {
      const user = await User.findByAnyId(paramId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      if (user.email === 'admin123@gmail.com') {
        return res.status(400).json({ message: 'Không thể xóa tài khoản Quản trị viên gốc' });
      }
      await User.deleteOne({ _id: user._id });
      return res.json({ message: 'Xóa người dùng thành công' });
    }

    const user = inMemoryUsers.find(
      (u) => String(u.id) === String(paramId) || String(u._id) === String(paramId)
    );
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (user.email === 'admin123@gmail.com') {
      return res.status(400).json({ message: 'Không thể xóa tài khoản Quản trị viên gốc' });
    }
    inMemoryUsers = inMemoryUsers.filter(
      (u) => String(u.id) !== String(paramId) && String(u._id) !== String(paramId)
    );
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ================= API THỐNG KÊ (DASHBOARD STATS) =================
app.get(['/api/stats', '/stats'], async (req, res) => {
  try {
    if (isMongoConnected) {
      const totalMovies = await Movie.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalComments = await Comment.countDocuments();

      const viewsAgg = await Movie.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]);
      const totalViews = viewsAgg[0]?.totalViews || 0;

      const genresAgg = await Movie.aggregate([
        { $group: { _id: { $toLower: '$genre' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const topMovies = await Movie.find()
        .sort({ views: -1 })
        .limit(5)
        .select('id title genre views image releaseDate');

      const recentUsers = await User.find({}, { password: 0 })
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        totalMovies,
        totalUsers,
        totalComments,
        totalViews,
        genres: genresAgg.map((g) => ({ name: g._id || 'Khác', count: g.count })),
        topMovies,
        recentUsers,
      });
    }

    // In-Memory stats
    const totalMovies = inMemoryMovies.length;
    const totalUsers = inMemoryUsers.length;
    const totalComments = inMemoryComments.length;
    const totalViews = inMemoryMovies.reduce((acc, m) => acc + (Number(m.views) || 0), 0);

    const genreMap = {};
    inMemoryMovies.forEach((m) => {
      const g = (m.genre || 'khác').toLowerCase().trim();
      genreMap[g] = (genreMap[g] || 0) + 1;
    });
    const genres = Object.keys(genreMap).map((k) => ({ name: k, count: genreMap[k] }));

    const topMovies = [...inMemoryMovies]
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 5);

    const recentUsers = inMemoryUsers
      .map(({ password, ...rest }) => rest)
      .slice(-5)
      .reverse();

    res.json({
      totalMovies,
      totalUsers,
      totalComments,
      totalViews,
      genres,
      topMovies,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê', error: error.message });
  }
});

// ================= API BÌNH LUẬN & ĐÁNH GIÁ (COMMENTS & REVIEWS) =================

// 1. Lấy toàn bộ bình luận (cho Admin quản lý hoặc lọc theo movieId)
app.get(['/api/comments', '/comments'], async (req, res) => {
  try {
    const { movieId } = req.query;
    if (isMongoConnected) {
      const filter = movieId ? { movieId: String(movieId) } : {};
      const comments = await Comment.find(filter).sort({ createdAt: -1 });
      return res.json(comments);
    }

    let results = [...inMemoryComments];
    if (movieId) {
      results = results.filter((c) => String(c.movieId) === String(movieId));
    }
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy bình luận', error: error.message });
  }
});

// 2. Lấy bình luận của 1 phim cụ thể
app.get(['/api/comments/movie/:movieId', '/comments/movie/:movieId'], async (req, res) => {
  try {
    const { movieId } = req.params;
    if (isMongoConnected) {
      const comments = await Comment.find({ movieId: String(movieId) }).sort({ createdAt: -1 });
      return res.json(comments);
    }

    const results = inMemoryComments
      .filter((c) => String(c.movieId) === String(movieId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// 3. Đăng bình luận mới
app.post(['/api/comments', '/comments'], async (req, res) => {
  try {
    const { movieId, movieTitle, userId, userName, userEmail, content, rating } = req.body;

    if (!movieId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung bình luận không được để trống.' });
    }

    const authorName = (userName && userName.trim()) ? userName.trim() : 'Khách';
    const numRating = Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : 5;

    if (isMongoConnected) {
      const newComment = await Comment.create({
        movieId: String(movieId),
        movieTitle: movieTitle || '',
        userId: userId || '',
        userName: authorName,
        userEmail: userEmail || '',
        content: content.trim(),
        rating: numRating,
      });
      return res.status(201).json(newComment);
    }

    const newComment = {
      id: 'c_' + Date.now(),
      movieId: String(movieId),
      movieTitle: movieTitle || '',
      userId: userId || '',
      userName: authorName,
      userEmail: userEmail || '',
      content: content.trim(),
      rating: numRating,
      createdAt: new Date().toISOString(),
    };
    inMemoryComments.unshift(newComment);
    return res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo bình luận', error: error.message });
  }
});

// 4. Xóa bình luận (Dành cho Admin duyệt / xóa spam)
app.delete(['/api/comments/:id', '/comments/:id'], async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isMongoConnected) {
      let deleted = null;
      if (mongoose.isValidObjectId(paramId)) {
        deleted = await Comment.findByIdAndDelete(paramId);
      }
      if (!deleted) {
        deleted = await Comment.findOneAndDelete({ id: paramId });
      }
      return res.json({ message: 'Đã xóa bình luận thành công' });
    }

    inMemoryComments = inMemoryComments.filter(
      (c) => String(c.id) !== String(paramId) && String(c._id) !== String(paramId)
    );
    return res.json({ message: 'Đã xóa bình luận thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa bình luận', error: error.message });
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
