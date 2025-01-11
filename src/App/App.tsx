import styles from "./style.module.scss"
import Board from "./component/Board"

function App() {
  return (
    <div className={styles.content}>
      <div className={styles.title}>Calendar Puzzle Solver</div>
      <Board />
    </div>
  )
}

export default App
