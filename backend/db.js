const mysql = require("mysql2");

//conecteaza la baza de date MySQL folosind variabilele de mediu
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Eroare la conectarea la MySQL:", err.message);
    process.exit(1);
  }
  console.log("Conectat la MySQL!");
});

module.exports = connection;