const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const PORT = 3300;
const app = express();

app.use(cors());
// `express.json()` berguna sebagai pengganti `body-parser` untuk membaca data di body yg dikirimkan FE
app.use(express.json());

// buat variabel penghubung antara MySQL-Express bernama `db`
const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "123456789",
	database: "db_kantor",
	port: 3306, // default port for mysql
	multipleStatements: true,
});

// tes koneksi MySQL-Backend kita
db.connect((err) => {
	if (err) {
		return console.error(`error: ${err.message}`);
	}
	console.log(`Connected to MySQL Server`);
});

app.get("/", (req, res) => {
	res.status(200).send("<h4>Intergrated MySQL-Exress</h4>");
});

// M4S5C2: Creating Routes for Spesific Queries - Metode GET
app.get("/karyawan", (req, res) => {
	// buat script query yg akan menjalankan perintah di MySQL
	let scriptQuery = "select * from karyawan;";
	if (req.query.nama) {
		scriptQuery = `select * from karyawan where nama = ${db.escape(req.query.nama)};`;
	}
	db.query(scriptQuery, (err, results) => {
		if (err) res.status(500).send(err);
		res.status(200).send(results);
	});
});

// M4S5C2: Creating Routes for Spesific Queries - Metode POST
app.post("/add-karyawan", (req, res) => {
	// cek apakah ada `.body` di req
	console.log(req.body);

	// destructure isi req.body agar lebih cepat
	let { nama, usia, email, berat, tahun, kota, idposisi } = req.body;

	// buat script query
	let insertQuery = `insert into karyawan values (null, ${db.escape(nama)}, ${db.escape(usia)},${db.escape(
		email
	)}, ${db.escape(berat)}, ${db.escape(kota)}, ${db.escape(tahun)}, ${db.escape(idposisi)});`;

	// masukkan ke dalam db MySQL
	db.query(insertQuery, (err, results) => {
		if (err) res.status(500).send(err);

		// jika proses berhasil, kirim `results` yang merupakan object dgn macam-macam properties
		// res.status(200).send(results);

		// jika ingin mengirim data terbaru, gunakan db.query sebelum `send(results)`
		// db.query digunakan untuk menjalan script query yg mendapatkan data terbaru di tabel
		db.query(`select * from karyawan where nama = ${db.escape(nama)};`, (err2, results2) => {
			if (err2) res.status(500).send(err2);
			res.status(200).send({ message: "Penambahan karyawan berhasil", data: results2 });
		});
	});
});

// M4S5C3: Creating Routes for Spesific Queries 2 - Metode Patch
app.patch("/edit-karyawan/:idkaryawan", (req, res) => {
	let dataUpdate = [];
	for (let prop in req.body) {
		dataUpdate.push(`${prop} = ${db.escape(req.body[prop])}`); // mirip dengan <column> = <data in column> in 1 specific `karyawan`
	}

	// buat script query dengan menggunakan array di atas
	// pakai kata `set` untuk menggunakan set of data (semisal array)
	let updateQuery = `update karyawan set ${dataUpdate} where idkaryawan = ${req.params.idkaryawan};`;
	console.log(updateQuery);
	db.query(updateQuery, (err, results) => {
		if (err) res.status(500).send(err);
		res.status(200).send(results); // results berisi data update yg menandakan data mana saja yang dipengaruhi, bukan data terbaru
		// untuk mendapatkan data terbaru, dpt menggunakan db.query `get` sebagaimana di line 69
	});
});

app.delete("/delete-karyawan/:idkaryawan", (req, res) => {
	let deleteQuery = `delete from karyawan where idkaryawan = ${req.params.idkaryawan};`;

	db.query(deleteQuery, (err, results) => {
		if (err) res.status(500).send(err);
		res.status(200).send(results);
	});
});

app.listen(PORT, console.log("API Running at", PORT));
