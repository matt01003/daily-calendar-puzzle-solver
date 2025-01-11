import { animated, useSpring } from "@react-spring/web"
import styles from "./style.module.scss"
import { ReactNode } from "react"

type Props = {
  board: string[][]
  i: number
  j: number
  onClick: Function
  children: ReactNode
}

const colors: any = {
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
  const { board, i, j, onClick, children } = props

  const cellColor = useSpring({
    backgroundColor: colors[board[i][j]],
    config: { duration: 500 },
  })

  const cellBorder = (board: any, i: number, j: number) => {
    const top = !board[i - 1] || board[i][j] !== board[i - 1][j] ? 1 : 0
    const right = board[i][j] !== board[i][j + 1] && board[i][j] !== "x" ? 1 : 0
    const bottom = !board[i + 1] || board[i + 1][j] === "x" ? 1 : 0
    const left = 0

    return { borderWidth: `${top}px ${right}px ${bottom}px ${left}px` }
  }

  return (
    <div className={styles.container}>
      <animated.div
        className={styles.cell}
        style={{ ...cellBorder(board, i, j), ...cellColor }}
        onClick={() => onClick()}
      ></animated.div>
      <div className={styles.text}>{children}</div>
    </div>
  )
}
