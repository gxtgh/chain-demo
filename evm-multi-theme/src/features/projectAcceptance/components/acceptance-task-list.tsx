import type { AcceptanceTask } from '../config/acceptance-types'

export function AcceptanceTaskList({
  tasks,
  title,
  labels,
  translateRole,
  translateStatus,
  translatePriority,
}: {
  tasks: AcceptanceTask[]
  title: string
  labels: {
    role: string
    status: string
    priority: string
    blocked: string
    note: string
  }
  translateRole: (role: AcceptanceTask['role']) => string
  translateStatus: (status: AcceptanceTask['status']) => string
  translatePriority: (priority: AcceptanceTask['priority']) => string
}) {
  return (
    <section className="surface-card">
      <div className="section-label">{title}</div>
      <div className="task-list">
        {tasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="task-card-top">
              <strong>{task.title}</strong>
              <span>{translateStatus(task.status)}</span>
            </div>
            <div className="task-meta-grid">
              <div>
                <span>{labels.role}</span>
                <strong>{translateRole(task.role)}</strong>
              </div>
              <div>
                <span>{labels.priority}</span>
                <strong>{translatePriority(task.priority)}</strong>
              </div>
              <div>
                <span>{labels.blocked}</span>
                <strong>{task.blocked ? 'Yes' : 'No'}</strong>
              </div>
            </div>
            <p>{task.note}</p>
            {task.link ? (
              <a className="text-link" href={task.link}>
                {task.link}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
