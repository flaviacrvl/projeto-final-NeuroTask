const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(cors());

let db;

const JWT_SECRET = "segredo123";

// ========================
// BANCO DE DADOS
// ========================
(async () => {
    db = await open({
        filename: "./database.sqlite",
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // Cria usuário admin caso não exista
    const admin = await db.get(
        "SELECT * FROM users WHERE username = ?",
        ["admin"]
    );

    if (!admin) {
        const senhaHash = await bcrypt.hash("1234", 10);

        await db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            ["admin", senhaHash]
        );

        console.log("Usuário admin criado.");
    }

    console.log("Banco de dados SQLite pronto!");
})();

// ========================
// MIDDLEWARE JWT
// ========================
function verificarToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token não fornecido."
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {

        if (err) {
            return res.status(403).json({
                success: false,
                message: "Token inválido."
            });
        }

        req.user = decoded;
        next();
    });
}

// ========================
// CADASTRO
// ========================
app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Preencha todos os campos."
        });
    }

    try {

        const senhaHash = await bcrypt.hash(password, 10);

        await db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, senhaHash]
        );

        res.status(201).json({
            success: true,
            message: "Usuário cadastrado com sucesso!"
        });

    } catch (e) {

        res.status(400).json({
            success: false,
            message: "Nome de usuário já existe."
        });
    }
});

// ========================
// LOGIN
// ========================
app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const user = await db.get(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Usuário ou senha incorretos."
        });
    }

    const senhaCorreta = await bcrypt.compare(
        password,
        user.password
    );

    if (!senhaCorreta) {
        return res.status(401).json({
            success: false,
            message: "Usuário ou senha incorretos."
        });
    }

    const token = jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    res.json({
        success: true,
        message: "Login realizado com sucesso!",
        token
    });
});

// ========================
// CRUD DE TAREFAS
// ========================

// LISTAR
app.get("/tasks", verificarToken, async (req, res) => {

    const tasks = await db.all(
        "SELECT * FROM tasks"
    );

    res.json(tasks);
});

// CRIAR
app.post("/tasks", verificarToken, async (req, res) => {

    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({
            message: "Título obrigatório."
        });
    }

    await db.run(
        "INSERT INTO tasks (title, description) VALUES (?, ?)",
        [title, description]
    );

    res.status(201).json({
        message: "Tarefa criada com sucesso."
    });
});

// ATUALIZAR
app.put("/tasks/:id", verificarToken, async (req, res) => {

    const { id } = req.params;
    const { title, description } = req.body;

    await db.run(
        "UPDATE tasks SET title = ?, description = ? WHERE id = ?",
        [title, description, id]
    );

    res.json({
        message: "Tarefa atualizada com sucesso."
    });
});

// EXCLUIR
app.delete("/tasks/:id", verificarToken, async (req, res) => {

    const { id } = req.params;

    await db.run(
        "DELETE FROM tasks WHERE id = ?",
        [id]
    );

    res.json({
        message: "Tarefa removida com sucesso."
    });
});

// ========================
// SERVIDOR
// ========================
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});