require("dotenv").config();
const pg = require("pg");
const express = require("express");
const client = new pg.Client(process.env.DATABASE_URL);
const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());

// GET /api/flavors
app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = /* sql */ `SELECT * from flavors ORDER BY created_at DESC`;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });

// GET /api/flavors/:id
app.get("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = /* sql */ `SELECT FROM flavors WHERE id=$1`;
      const response = await client.query(SQL, [req.params.id]);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });

// POST /api/flavors
app.post("/api/flavors", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
              INSERT INTO flavors(name)
              VALUES($1, $2, $3)
              RETURNING *
          `;
      const response = await client.query(SQL, [req.body.name]);
      res.status(201).send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

// DELETE /api/flavors/:id
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = /* sql */ `
            DELETE FROM flavors
            WHERE id=$1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
})

// PUT /api/flavors/:id
app.put("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
              UPDATE flavors
              SET txt=$1, ranking=$2, updated_at=now()
              WHERE id=$3 RETURNING *
          `;
      const response = await client.query(SQL, [
        req.body.txt,
        req.body.ranking,
        req.params.id,
      ]);
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

const init = async () => {
    await client.connect();
  
    let SQL = /* sql */ `
          DROP TABLE IF EXISTS flavors;
          CREATE TABLE flavors(
              id SERIAL PRIMARY KEY,
              name VARCHAR(55) NOT NULL,
              is_favorite BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT now(),
              updated_at TIMESTAMP DEFAULT now()
          );
      `;
    await client.query(SQL);
    console.log("tables created");
  
    SQL = /* sql */ `
          INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', true);
          INSERT INTO flavors(name) VALUES('Vanilla');
          INSERT INTO flavors(name) VALUES('Strawberry');
          INSERT INTO flavors(name) VALUES('Cookie Dough');
          INSERT INTO flavors(name) VALUES('Coffee');
      `;
  
    await client.query(SQL);
    console.log("data seeded");
  
    const port = process.env.PORT;
    app.listen(port, () => console.log(`listening on port ${port}`));
  };
  
  init();