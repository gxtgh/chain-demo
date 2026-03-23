import styles from "./page-header.module.scss";

export function PageHeader(props: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className={styles.header}>
      <p className={styles.eyebrow}>{props.eyebrow}</p>
      <h1 className={styles.title}>{props.title}</h1>
      <p className={styles.description}>{props.description}</p>
    </section>
  );
}
