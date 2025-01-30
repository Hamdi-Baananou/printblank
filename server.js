const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;

app.use(express.json());
app.use(require("cors")());

// ✅ Debugging: Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`);
  next();
});

// ✅ Root Route for Cloudflare Health Check
app.get("/", (req, res) => {
  res.send("🚀 Print server is running!");
});

// ✅ Health Check Endpoint for Cloudflare
app.get("/health", (req, res) => {
  res.json({ status: "✅ OK", timestamp: new Date().toISOString() });
});

// ✅ Print Function Using Notepad
const printReceipt = (content) => {
  const tempFilePath = path.join(__dirname, "print_receipt.txt");

  // Write receipt content to a temporary file
  fs.writeFileSync(tempFilePath, content);

  // Use Notepad's print function
  const printCommand = `notepad /p "${tempFilePath}"`;

  exec(printCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Printing failed:", error.message);
      return;
    }
    console.log("✅ Print job sent:", stdout);
    fs.unlinkSync(tempFilePath); // Clean up temp file after printing
  });
};

// ✅ API Endpoint to Receive Print Jobs
app.post("/print", (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "❌ Missing content" });
  }

  printReceipt(content);
  res.json({ message: "✅ Print job sent!" });
});

// ✅ Start Print Server
app.listen(port, () => {
  console.log(`🚀 Print server running on port ${port}`);
});
