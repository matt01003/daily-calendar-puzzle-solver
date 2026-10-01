import { useCallback, useEffect, useMemo, useState } from "react"
import {
  buildBoard,
  DateCellKind,
  formatSolution,
  PuzzleType,
  solve,
} from "../../../puzzle-solver"

type Orientation = {
  index: number
  maskIndex: number
}

export default function useBoard() {
  const [count, setCount] = useState(0)
  const [solutions, setSolutions] = useState<Orientation[][]>([])
  const [type, setType] = useState<PuzzleType>("DEFAULT")
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth(),
    day: new Date().getDate(),
    weekday: new Date().getDay(),
  })

  const formattedSolutions = useMemo(() => {
    if (!solutions.length) return null
    return formatSolution(type, solutions[count])
  }, [type, solutions, count])

  const updateDate = useCallback((kind: DateCellKind, value: number) => {
    setSelectedDate((prev) => {
      switch (kind) {
        case "month":
          return { ...prev, month: value }
        case "day":
          return { ...prev, day: value }
        case "weekday":
          return { ...prev, weekday: value }
        default:
          return prev
      }
    })
  }, [])

  useEffect(() => {
    setSolutions(solve(type, buildBoard(type, selectedDate)))
    setCount(0)
  }, [type, selectedDate])

  return {
    type,
    setType,
    count,
    setCount,
    solutions,
    formattedSolutions,
    updateDate,
  }
}
