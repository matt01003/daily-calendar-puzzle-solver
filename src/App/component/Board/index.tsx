import styles from "./style.module.scss"
import { range } from "lodash"
import Button from "../Button"
import Cell from "../Cell"
import useBoard from "./useBoard"

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
]

export default function PuzzleBoard() {
  const { count, setCount, solutions, formattedSolutions, updateDate } =
    useBoard()
  if (!formattedSolutions) return null

  const renderCells = (rangeStart: number, rowOffset: number, labels?: any) => {
    return labels.map((e: any, i: number) => {
      const index = rangeStart + i
      return (
        <Cell
          key={index}
          board={formattedSolutions}
          i={Math.floor(i / 7) + rowOffset}
          j={i % 7}
          onClick={() => updateDate(index)}
        >
          {e < 10 ? "0" + e : e}
        </Cell>
      )
    })
  }

  return (
    <>
      <div className={styles.board}>
        <div className={styles.cellContainer}>
          {renderCells(0, 0, MONTHS.slice(0, 6))}
          <div className={styles.spacer}></div>
          {renderCells(6, 1, MONTHS.slice(6, 12))}
          <div className={styles.spacer}></div>
          {renderCells(MONTHS.length, 2, range(1, 32))}
          <div className={styles.spacer}></div>
          <div className={styles.spacer}></div>
          <div className={styles.spacer}></div>
          <div className={styles.spacer}></div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button disabled={count === 0} onClick={() => setCount(count - 1)}>
          prev
        </Button>
        <Button
          disabled={count === solutions.length - 1}
          onClick={() => setCount(count + 1)}
        >
          next
        </Button>
        <div>
          {count + 1}/{solutions.length}
        </div>
      </div>
    </>
  )
}
