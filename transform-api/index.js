import express from "express";
import HTMLtoJSX from "htmltojsx";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/convert", (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: "Missing 'html' in body." });
  }

  try {
    const converter = new HTMLtoJSX({ createClass: false });
    const jsx = converter.convert(html);
    res.json({ jsx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Mirror API running at http://localhost:${PORT}`);
});
