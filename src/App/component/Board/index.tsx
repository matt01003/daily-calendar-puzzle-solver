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

  if (!formattedSolutions) return null

  const renderCells = (
    rangeStart: number,
    rowOffset: number,
    colOffset: number,
    labels: number[] | string[]
  ) => {
    return labels.map((e: number | string, i: number) => {
      const index = rangeStart + i
      const row = Math.floor(i / 7) + rowOffset
      const col = (i % 7) + colOffset
      return (
        <Cell
          key={index}
          board={formattedSolutions}
          row={row}
          col={col}
          onClick={() => updateDate(index)}
        >
          {typeof e === "string" ? e : e < 10 ? "0" + e : e}
        </Cell>
      )
    })
  }

  return (
    <>
      <div className={styles.board}>
        <div className={styles.cellContainer}>
          {type === "DEFAULT" && (
            <>
              {renderCells(0, 0, 0, MONTHS.slice(0, 6))}
              <div className={styles.spacer}></div>
              {renderCells(6, 1, 0, MONTHS.slice(6, 12))}
              <div className={styles.spacer}></div>
            </>
          )}
          {type === "CENTER" && (
            <>
              <div className={styles.spacer}></div>
              {renderCells(0, 0, 1, MONTHS.slice(0, 5))}
              <div className={styles.spacer}></div>
              {renderCells(6, 1, 0, MONTHS.slice(5, 13))}
            </>
          )}
          {renderCells(MONTHS.length, 2, 0, range(1, 32))}
          {/* {type === "STANDARD" ? (
            <>
              {renderCells(MONTHS.length, 6, 3, ["MON", "TUE", "WED", "THU"])}
              <div className={styles.spacer}></div>
              <div className={styles.spacer}></div>
              <div className={styles.spacer}></div>
              <div className={styles.spacer}></div>
              {renderCells(MONTHS.length, 7, 4, ["FRI", "SAT", "SUN"])}
            </>
          ) : ( */}
          <>
            <div className={styles.spacer}></div>
            <div className={styles.spacer}></div>
            <div className={styles.spacer}></div>
            <div className={styles.spacer}></div>
          </>
          {/* )} */}
        </div>
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
          onClick={() => setType(type === "CENTER" ? "DEFAULT" : "CENTER")}
        >
          {type}
        </Button>
      </div>
    </>
  )
}