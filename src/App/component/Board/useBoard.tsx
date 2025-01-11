import { useCallback, useEffect, useMemo, useState } from "react"
import { createBoard, formatSolution } from "../../../puzzle-solver"

export default function useBoard() {
  const [count, setCount] = useState(0)
  const [solutions, setSolutions] = useState<any>([])
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth(),
    day: new Date().getDate(),
  })
  const boardSolver = useMemo(
    () => createBoard("LEFT", selectedDate.month, selectedDate.day),
    [selectedDate]
  )

  const formattedSolutions = useMemo(() => {
    if (!solutions.length) return null
    return formatSolution("LEFT", solutions[count])
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
    count,
    setCount,
    solutions,
    formattedSolutions,
    updateDate,
  }
}
