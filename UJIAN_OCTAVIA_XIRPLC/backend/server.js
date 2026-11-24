const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Mengambil seluruh alat
app.get('/api/alat', async (req, res) => {
  try {
    const result = await pool.query(
  `SELECT * FROM alat ORDER BY id_alat`
);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Gagal mengambil seluruh alat:', error.message);

    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data alat'
    });
  }
});

// Mengambil satu alat berdasarkan ID
app.get('/api/alat/:id_alat', async (req, res) => {
  const id_alat = Number(req.params.id_alat);

  if (!Number.isSafeInteger(id_alat) || id_alat <= 0) {
    return res.status(400).json({
      message: 'ID alat harus berupa bilangan bulat positif'
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM alat WHERE id_alat = $1',
      [id_alat]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Alat tidak ditemukan'
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Gagal mengambil alat:', error.message);

    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data alat'
    });
  }
});

// Menambahkan alat
app.post('/api/alat', async (req, res) => {
  const { nama_alat, kondisi, stok, lokasi, id_kategori } = req.body;

  if (
    typeof nama_alat !== 'string' ||
    !nama_alat.trim() ||
    typeof kondisi !== 'string' ||
    !kondisi.trim() ||
    !Number.isInteger(stok) ||
    stok < 0 ||
    typeof lokasi !== 'string' ||
    !lokasi.trim() ||
    !Number.isInteger(id_kategori) ||
    id_kategori <= 0
  ) {
    return res.status(400).json({
      message: 'Data alat tidak valid'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO alat
       (nama_alat, kondisi, stok, lokasi, id_kategori)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        nama_alat.trim(),
        kondisi.trim(),
        stok,
        lokasi.trim(),
        id_kategori
      ]
    );

    return res.status(201).json({
      message: 'Alat berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Gagal menambahkan alat:', error.message);

    if (error.code === '23503') {
      return res.status(400).json({
        message: 'Kategori alat tidak ditemukan'
      });
    }

    return res.status(500).json({
      message: 'Terjadi kesalahan saat menambahkan alat'
    });
  }
});

// Memperbarui alat
app.put('/api/alat/:id_alat', async (req, res) => {
  const id_alat = Number(req.params.id_alat);
  const { nama_alat, kondisi, stok, lokasi, id_kategori } = req.body;

  if (!Number.isSafeInteger(id_alat) || id_alat <= 0) {
    return res.status(400).json({
      message: 'ID alat tidak valid'
    });
  }

  if (
    typeof nama_alat !== 'string' ||
    !nama_alat.trim() ||
    typeof kondisi !== 'string' ||
    !kondisi.trim() ||
    !Number.isInteger(stok) ||
    stok < 0 ||
    typeof lokasi !== 'string' ||
    !lokasi.trim() ||
    !Number.isInteger(id_kategori) ||
    id_kategori <= 0
  ) {
    return res.status(400).json({
      message: 'Data alat tidak valid'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE alat
       SET nama_alat = $1,
           kondisi = $2,
           stok = $3,
           lokasi = $4,
           id_kategori = $5
       WHERE id_alat = $6
       RETURNING *`,
      [
        nama_alat.trim(),
        kondisi.trim(),
        stok,
        lokasi.trim(),
        id_kategori,
        id_alat
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Alat tidak ditemukan'
      });
    }

    return res.status(200).json({
      message: 'Alat berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Gagal memperbarui alat:', error.message);

    if (error.code === '23503') {
      return res.status(400).json({
        message: 'Kategori alat tidak ditemukan'
      });
    }

    return res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui alat'
    });
  }
});

// Menghapus alat
app.delete('/api/alat/:id_alat', async (req, res) => {
  const id_alat = Number(req.params.id_alat);

  if (!Number.isSafeInteger(id_alat) || id_alat <= 0) {
    return res.status(400).json({
      message: 'ID alat tidak valid'
    });
  }

  try {
    const result = await pool.query(
      'DELETE FROM alat WHERE id_alat = $1 RETURNING *',
      [id_alat]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Alat tidak ditemukan'
      });
    }

    return res.status(200).json({
      message: 'Alat berhasil dihapus'
    });
  } catch (error) {
    console.error('Gagal menghapus alat:', error.message);

    return res.status(500).json({
      message: 'Gagal menghapus produk'
    });
  }
});

// Mengambil seluruh kategori
app.get('/api/kategori_alat', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM kategori_alat ORDER BY id_kategori'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Gagal mengambil seluruh kategori:', error.message);

    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kategori'
    });
  }
});

// Mengambil satu kategori berdasarkan ID
app.get('/api/kategori_alat/:id_kategori', async (req, res) => {
  const id_kategori = Number(req.params.id_kategori);

  if (!Number.isSafeInteger(id_kategori) || id_kategori <= 0) {
    return res.status(400).json({
      message: 'ID kategori tidak valid'
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM kategori_alat WHERE id_kategori = $1',
      [id_kategori]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Kategori tidak ditemukan'
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Gagal mengambil kategori:', error.message);

    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kategori'
    });
  }
});

// Mengambil seluruh peminjaman
app.get('/api/peminjaman', async (req, res) => {
  try {
    const result = await pool.query(
  `SELECT peminjaman.id_peminjaman, peminjaman.nama_peminjam, peminjaman.kelas, peminjaman.tanggal_pinjam, peminjaman.tanggal_kembali, peminjaman.jumlah, peminjaman.status, 
    alat.nama_alat FROM peminjaman
    INNER JOIN alat ON peminjaman.id_alat = alat.id_alat ORDER BY id_peminjaman`
);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Gagal memuat seluruh peminjaman:', error.message);

    res.status(500).json({
      message: 'Terjadi kesalahan saat memuat data peminjaman'
    });
  }
});

// Mengambil satu peminjaman berdasarkan ID
app.get('/api/peminjaman/:id_peminjaman', async (req, res) => {
  const id_peminjaman = Number(req.params.id_peminjaman);

  if (!Number.isSafeInteger(id_peminjaman) || id_peminjaman <= 0) {
    return res.status(400).json({
      message: 'ID kategori tidak valid'
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM peminjaman WHERE id_peminjaman = $1',
      [id_peminjaman]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Peminjaman tidak ditemukan'
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Gagal memuat peminjaman:', error.message);

    res.status(500).json({
      message: 'Terjadi kesalahan saat memuat data peminjaman'
    });
  }
});

// Menambahkan peminjaman
app.post('/api/peminjaman', async (req, res) => {
  const { nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status, id_alat } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO peminjaman
       (nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status, id_alat)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        nama_peminjam.trim(),
        kelas.trim(),
        tanggal_pinjam,
        tanggal_kembali || null,
        jumlah,
        status.trim(),
        id_alat
      ]
    );

    return res.status(201).json({
      message: 'Data peminjaman berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Gagal menambahkan data peminjaman:', error.message);

    if (error.code === '23503') {
      return res.status(400).json({
        message: 'Data peminjaman tidak ditemukan'
      });
    }

    return res.status(500).json({
      message: 'Terjadi kesalahan saat menambahkan data peminjaman'
    });
  }
});

// Memperbarui peminjaman
app.put('/api/peminjaman/:id_peminjaman', async (req, res) => {
  const id_peminjaman = Number(req.params.id_peminjaman);
  const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE peminjaman
       SET id_alat = $1,
           nama_peminjam = $2,
           kelas = $3,
           tanggal_pinjam = $4,
           tanggal_kembali = $5,
           jumlah = $6,
           status = $7
       WHERE id_peminjaman = $8
       RETURNING *`,
      [ 
        id_alat,
        nama_peminjam.trim(),
        kelas.trim(),
        tanggal_pinjam,
        tanggal_kembali,
        jumlah,
        status.trim(),
        id_peminjaman
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Data peminjaman tidak ditemukan'
      });
    }

    return res.status(200).json({
      message: 'Data peminjaman berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Gagal memperbarui data:', error.message);

    return res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui data peminjaman'
    });
  }
});

// Menghapus peminjaman
app.delete('/api/peminjaman/:id_peminjaman', async (req, res) => {
  const id_peminjaman = Number(req.params.id_peminjaman);

  if (!Number.isSafeInteger(id_peminjaman) || id_peminjaman <= 0) {
    return res.status(400).json({
      message: 'ID peminjaman tidak valid'
    });
  }

  try {
    const result = await pool.query(
      'DELETE FROM peminjaman WHERE id_peminjaman = $1 RETURNING *',
      [id_peminjaman]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Data peminjaman tidak ditemukan'
      });
    }

    return res.status(200).json({
      message: 'Data peminjaman berhasil dihapus'
    });
  } catch (error) {
    console.error('Gagal menghapus data peminjaman:', error.message);

    return res.status(500).json({
      message: 'Gagal menghapus data peminjaman'
    });
  }
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});