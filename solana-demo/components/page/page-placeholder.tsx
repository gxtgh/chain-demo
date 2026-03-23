import styles from "./page-placeholder.module.scss";

export function PagePlaceholder(props: {
  title: string;
  description: string;
  todo: string[];
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{props.title}</h2>
      <p className={styles.body}>{props.description}</p>
      <div className={styles.list}>
        {props.todo.map((item) => (
          <div key={item} className={styles.item}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

