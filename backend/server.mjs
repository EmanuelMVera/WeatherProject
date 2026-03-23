import "./src/config/dotenv.mjs";
import app from "./src/app.mjs";

const PORT = process.env.PORT;

if (!PORT) {
  console.error("ERROR: The PORT environment variable is not defined.");
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
