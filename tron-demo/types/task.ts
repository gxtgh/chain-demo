export interface BatchTaskLog {
  timestamp?: string;
  level: "info" | "error";
  message: string;
}
