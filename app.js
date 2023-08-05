const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
app.use(bodyParser.json());

const config = {
  host: 'database-1-instance-1.ckdn0nhhbq5s.us-east-1.rds.amazonaws.com',
  port: '3306',
  user: 'admin',
  password: 'admin123',
  database: 'main'
};

app.post('/store-products', async (req, res) => {
  const { products } = req.body;

  try {
    const connection = await mysql.createConnection(config);
    await connection.query('CREATE DATABASE IF NOT EXISTS main;');
    await connection.query('USE main;');
    await connection.query('DROP TABLE IF EXISTS products;');
    await connection.query('CREATE TABLE IF NOT EXISTS products(id int NOT NULL AUTO_INCREMENT, name varchar(100), price varchar(100), availability boolean, PRIMARY KEY(id));');
    const insertQuery = 'INSERT INTO products (name, price, availability) VALUES ?';
    const values = products.map((product) => [product.name, product.price, product.availability]);
    await connection.query(insertQuery, [values]);
    await connection.end();

    res.json({ message: 'Success.' });
  } catch (error) {
    console.error('Error storing products:', error);
    res.sendStatus(500);
  }
});

app.get('/list-products', async (req, res) => {
  try {
    const connection = await mysql.createConnection(config);
    await connection.query('USE main;');
    const [rows] = await connection.query('SELECT * FROM products;');
    await connection.end();

    res.status(200).json({ products: rows });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(80, () => {
  console.log('Server is running on port 80');
});