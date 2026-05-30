# NeuroTask Backend

O projeto NeuroTask foi desenvolvido em Node.js com Express para gerenciamento de tarefas e autenticação de usuários.

## Tecnologias Utilizadas

- Node.js
- Express
- SQLite
- JWT (JSON Web Token)
- bcrypt
- CORS

## Instalação

Clone o repositório:

```bash
git clone https://github.com/flaviacrvl/projeto-final-NeuroTask
```

Entre na pasta:

```bash
cd NeuroTask-backend
```

Instale as dependências:

```bash
npm install
```

## Como Executar

Inicie o servidor:

```bash
node server.js
```

O servidor será executado em:

```txt
http://localhost:3000
```

## Usuário Padrão

```json
{
  "username": "admin",
  "password": "1234"
}
```

## Endpoints

### Cadastro

POST /register

```json
{
  "username": "usuario",
  "password": "123456"
}
```

### Login

POST /login

```json
{
  "username": "usuario",
  "password": "123456"
}
```

Retorna:

```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

### Listar tarefas

GET /tasks

Header:

```txt
Authorization: Bearer TOKEN
```

### Criar tarefa

POST /tasks

```json
{
  "title": "Estudar Backend",
  "description": "Finalizar atividade"
}
```

### Atualizar tarefa

PUT /tasks/:id

### Excluir tarefa

DELETE /tasks/:id

## Segurança

- Senhas criptografadas com bcrypt.
- Rotas protegidas utilizando JWT.
