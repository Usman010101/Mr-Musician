import styles from "./dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Artist Dashboard</h1>
          <p className={styles.subtitle}>Listening data as of February 4, 2023</p>
        </div>

        {/* Monthly Listeners Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Monthly Listeners</h2>
          <div className={styles.chartWrapper}>
            <div className={styles.barChart}>
              {[80, 20, 10, 0].map((height, index) => (
                <div 
                  key={index}
                  className={styles.bar} 
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className={styles.monthLabels}>
              {["JAN", "FEB", "MAY", "APR", "NAV", "JUN", 
                "JUL", "AUG", "SEPT", "DCT", "NOV", "DEC"].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.gridContainer}>
          {/* Songs Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>All-Time - Songs</h2>
            <ul className={styles.statsList}>
              {[
                ["1. Mine Is God", "15:38:009"],
                ["2. Green Eyes", "14:30:107"],
                ["3. King of the Beach", "15:02:399"],
                ["4. My Head Hurts", "9:52:045"],
                ["5. Tarantula", "2:892:362"]
              ].map(([title, time]) => (
                <li key={title}>
                  <span>{title}</span>
                  <span>{time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Albums Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>All-Time - Album</h2>
            <ul className={styles.statsList}>
              {[
                ["1. King of the Beach", "12:05:xxxx"],
                ["2.", "8:44:xxxx"],
                ["3. Afraid of Heights", "2:85:xxxx"],
                ["4. Hideaway", "10:04:xxxx"],
                ["5. Caviar", "6:03:xxxx"]
              ].map(([title, time]) => (
                <li key={title}>
                  <span>{title}</span>
                  <span>{time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2022 Summary Grid */}
        <div className={styles.gridContainer}>
          {[
            ["Source of Streams", [
              "Your profile is chatting",
              "Listeners playlists & library",
              "Other listeners playlists"
            ]],
            ["Revenue", [
              "Streams",
              "Hardtheddar",
              "Ticket Sales"
            ]],
            ["Top Streamed", [
              "Kings of the Beach",
              "Kins of God",
              "Green Eyes"
            ]]
          ].map(([title, items]) => (
            <div key={title} className={styles.card}>
              <h2 className={styles.cardTitle}>2022 Summary - {title}</h2>
              <ul className={styles.bulletList}>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}