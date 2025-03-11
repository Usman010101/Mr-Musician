
import styles from './album-header.module.css';

const AlbumHeader = ({ title, description, songCount, duration, coverUrl }) => {
  return (
    <div className={`${styles.header} d-flex align-items-start`}>
      <img src={coverUrl} alt={title} className={styles.cover} />
      
      <div className="flex-grow-1 ms-4">
        <h1 className={styles.title}>
          {title} <span className={styles.mix}>mix</span>
        </h1>
        <p className={styles.description}>{description}</p>
        
        <div className="d-flex align-items-center">
          <span className={styles.info}>{songCount} songs</span>
          <span className={styles.dot}>•</span>
          <span className={styles.info}>{duration}</span>
          
          <button className={`${styles.playButton} ms-auto`}>
            <span>Play All</span>
            <i className="bi bi-play-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlbumHeader;