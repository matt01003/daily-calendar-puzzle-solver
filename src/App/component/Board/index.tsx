import { ReactElement } from "react"
import styles from "./style.module.scss"
import Button from "../Button"
import Cell from "../Cell"
import useBoard from "./useBoard"
import {
  getLabeledCells,
  LabeledCell,
  puzzleDimensions,
} from "../../../puzzle-solver"

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

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

const labelFor = (cell: LabeledCell): string => {
  switch (cell.kind) {
    case "month":
      return MONTHS[cell.value]
    case "day":
      return String(cell.value).padStart(2, "0")
    case "weekday":
      return WEEKDAYS[cell.value]
  }
}

export default function Board() {
  const {
    type,
    setType,
    count,
    setCount,
    solutions,
    formattedSolutions,
    updateDate,
  } = useBoard()

  if (!formattedSolutions) {
    return <div className={styles.noSolution}>No solution found for this date.</div>
  }

  const { ROWS, COLS } = puzzleDimensions[type]
  const cellByPos = new Map(
    getLabeledCells(type).map((cell) => [`${cell.row},${cell.col}`, cell])
  )

  // Walk the grid in row-major order, rendering a labeled Cell for every free
  // position and a spacer for every wall. Positions and wall layout both come
  // from the solver, so no calendar geometry is duplicated here.
  const renderBoard = (): ReactElement[] => {
    const elements: ReactElement[] = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const key = row * COLS + col
        const cell = cellByPos.get(`${row},${col}`)
        if (cell) {
          elements.push(
            <Cell
              key={key}
              board={formattedSolutions}
              row={row}
              col={col}
              onClick={() => updateDate(cell.kind, cell.value)}
            >
              {labelFor(cell)}
            </Cell>
          )
        } else {
          const isBottomWall = row === ROWS - 1
          const hasCellRight = cellByPos.has(`${row},${col + 1}`)
          elements.push(
            <div
              key={key}
              className={isBottomWall ? styles.spacer : styles.spacer2}
              style={
                isBottomWall && hasCellRight ? { borderRightWidth: 1.5 } : undefined
              }
            />
          )
        }
      }
    }
    return elements
  }

  return (
    <>
      <div className={styles.board}>
        <div className={styles.cellContainer}>{renderBoard()}</div>
      </div>
      <div className={styles.buttonContainer}>
        <Button disabled={count === 0} onClick={() => setCount(count - 1)}>
          Prev
        </Button>
        <Button
          disabled={count === solutions.length - 1}
          onClick={() => setCount(count + 1)}
        >
          Next
        </Button>
        <div>
          {count + 1}/{solutions.length}
        </div>
        <Button
          style={{ marginLeft: "auto" }}
          onClick={() => setType(type === "STANDARD" ? "DEFAULT" : "STANDARD")}
        >
          {type}
        </Button>
      </div>
    </>
  )
}
