import app from "./src/app.mjs";

const PORT = process.env.PORT || 3001;

if (!PORT) {
  console.error("ERROR: The PORT environment variable is not defined.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
