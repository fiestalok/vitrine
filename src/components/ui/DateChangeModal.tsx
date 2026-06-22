import styles from './DateChangeModal.module.css';

interface Props {
  unavailableNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function DateChangeModal({ unavailableNames, onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Changer de date</h3>
        <p className={styles.text}>
          Ces articles ne sont pas disponibles à ces dates&nbsp;:
        </p>
        <ul className={styles.list}>
          {unavailableNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className={styles.text}>
          Êtes-vous sûr de vouloir changer de date&nbsp;? Ces articles seront supprimés du panier.
          Vous pourrez ensuite regarder ceux disponibles pour vos nouvelles dates.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Annuler</button>
          <button className={styles.confirm} onClick={onConfirm}>Changer quand même</button>
        </div>
      </div>
    </div>
  );
}
