import "server-only";
import path from "node:path";
import { LocalFileStorage } from "./local-storage";
import type { FileStorage } from "./types";

export const storage: FileStorage = new LocalFileStorage(path.join(process.cwd(), "storage"));
