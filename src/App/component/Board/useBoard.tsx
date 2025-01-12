import { useCallback, useEffect, useMemo, useState } from "react"
import { createBoard, formatSolution, PuzzleType } from "../../../puzzle-solver"

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
  })

  const boardSolver = useMemo(
    () => createBoard(type, selectedDate.month, selectedDate.day),
    [selectedDate, type]
  )

  const formattedSolutions = useMemo(() => {
    if (!solutions.length) return null
    return formatSolution(type, solutions[count])
  }, [solutions, count])

  const updateDate = useCallback((index: number) => {
    setSelectedDate((prev) =>
      index < 12 ? { ...prev, month: index } : { ...prev, day: index - 11 }
    )
  }, [])

  useEffect(() => {
    const newSolutions = boardSolver.solve()
    setSolutions(newSolutions)
    setCount(0)
  }, [boardSolver])

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
