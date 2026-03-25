import { useUi } from "../ui/ui-context";

export type TaskLog = {
  id: string;
  status: "info" | "success" | "error";
  message: string;
};

type TaskLogPanelProps = {
  title?: string;
  logs: TaskLog[];
};

export function TaskLogPanel({ title = "Execution Logs", logs }: TaskLogPanelProps) {
  const { text } = useUi();

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h3>{title === "Execution Logs" ? text.common.executionLogs : title}</h3>
        <span>
          {logs.length} {text.common.items}
        </span>
      </div>
      {logs.length ? (
        <div className="log-list">
          {logs.map((log) => (
            <div className={`log-item ${log.status}`} key={log.id}>
              <strong>{log.status.toUpperCase()}</strong>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">{text.common.noLogs}</p>
      )}
    </section>
  );
}
