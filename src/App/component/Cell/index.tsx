import { animated, useSpring } from "@react-spring/web"
import styles from "./style.module.scss"
import { ReactNode } from "react"

type Props = {
  board: string[][]
  row: number
  col: number
  onClick: Function
  children: ReactNode
}

const colors: { [key: string]: string } = {
  0: "#6B7280",
  1: "#EF4444",
  2: "#F59E0B",
  3: "#10B981",
  4: "#3B82F6",
  5: "#6366F1",
  6: "#8B5CF6",
  7: "#EC4899",
  8: "red",
  9: "blue",
  ".": "lightgray",
}

export default function Cell(props: Props) {
  const { board, row, col, onClick, children } = props

  const cellColor = useSpring({
    backgroundColor: colors[board[row][col]],
    config: { duration: 500 },
  })

  const cellBorder = (board: string[][], row: number, col: number) => {
    const top =
      !board[row - 1] || board[row][col] !== board[row - 1][col] ? 1.5 : 0
    const right =
      board[row][col] !== board[row][col + 1] && board[row][col] !== "x"
        ? 1.5
        : 0
    const bottom = !board[row + 1] || board[row + 1][col] === "x" ? 1.5 : 0
    const left = !board[row][col - 1] || board[row][col - 1] === "x" ? 1.5 : 0

    return { borderWidth: `${top}px ${right}px ${bottom}px ${left}px` }
  }

  return (
    <div className={styles.container}>
      <animated.button
        className={styles.cell}
        disabled={board[row][col] === "."}
        style={{ ...cellBorder(board, row, col), ...cellColor }}
        onClick={() => onClick()}
      ></animated.button>
      <div
        className={styles.text}
        style={board[row][col] === "." ? { fontWeight: "600" } : {}}
      >
        {children}
      </div>
    </div>
  )
}
