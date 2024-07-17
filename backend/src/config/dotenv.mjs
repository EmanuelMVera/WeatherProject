import { config } from "dotenv";

const result = config();
if (result.error) {
  throw result.error;
}

export default result.parsed;
