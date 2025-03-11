// Button.js
import styles from './Button.module.css'

export default function Button({ children, className = "", style = {}, onClick }) {
  return (
    <button className={`${styles.button} ${className}`} style={style} onClick={onClick}>
      {children}
    </button>
  );
}
