require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const Note = require("./models/note");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(cors());
app.use(express.static("static"));
app.use(express.json());
app.use(requestLogger);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", async (request, response) => {
  const notes = await Note.find({});

  response.json(notes);
});

app.get("/api/notes/:id", async (request, response) => {
  try {
    const note = await Note.findById(request.params.id);

    response.json(note);
  } catch (err) {
    response.status(404).json({
      error: err.message,
    });
  }
});

app.post("/api/notes", async (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  const savedNote = await note.save();

  response.json(savedNote);
});

app.put("/api/notes/:id", async (request, response) => {
  try {
    const note = await Note.findById(request.params.id);

    if (!note) {
      return response.status(404).json({ error: "Note not found" });
    }

    note.important = !note.important;

    await note.save();

    response.json(note);
  } catch (err) {
    console.error(err);
    response.status(500).json({
      error: "Internal server error",
    });
  }
});

app.delete("/api/notes/:id", async (request, response) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(request.params.id);

    if (!deletedNote) {
      return response.status(404).json({ error: "Note not found" });
    }

    response.status(204).end();
  } catch (err) {
    console.error(err);
    response.status(500).json({
      error: "Internal server error",
    });
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
