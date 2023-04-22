import styles from "./loading.module.css";


export const Loading: React.FC<{ height?: number, width?: number }> = ({ height, width }) => {
	return (
		<div className={styles.loader} style={{ height: `${height ?? 25}px`, width: `${width ?? 25}px` }}>

		</div>
	)
}