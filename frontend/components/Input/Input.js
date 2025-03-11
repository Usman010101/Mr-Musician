// InputField.js
import styles from './Input.module.css';

export default function Input({ className = "", style = {}, icon, ...props }) {
  return (
    <div className={`${styles['input-container']}`}>
      {icon && <span className={styles.icon}>{icon}</span>} {/* Render the icon if provided */}
      <input 
        className={`${styles['input-field']} ${className}`} 
        style={style} 
        {...props} // Spread remaining props like placeholder, type, etc.
      />
    </div>
  );
}
