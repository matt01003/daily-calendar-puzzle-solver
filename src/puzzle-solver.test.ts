import { describe, it, expect } from "vitest"
import {
  buildBoard,
  computeItemMasks,
  formatSolution,
  getDateCells,
  getItemMasksAndFirstXCols,
  items,
  PuzzleType,
  puzzleByType,
  solve,
} from "./puzzle-solver"

const cellCount = (piece: string[]) =>
  piece.join("").split("").filter((c) => c === "x").length

const totalPieceCells = (type: PuzzleType) =>
  items[type].reduce((acc, piece) => acc + cellCount(piece), 0)

const wallCount = (type: PuzzleType) =>
  puzzleByType[type].join("").split("").filter((c) => c === "x").length

// DEFAULT has no weekday cell; STANDARD blocks one weekday cell in addition to
// the month and day cells.
const dateCellCount = (type: PuzzleType) => (type === "STANDARD" ? 3 : 2)

type DateInput = { month: number; day: number; weekday: number }

// Reconstruct a piece's occupied cells from a formatted board and confirm the
// solution is internally consistent: every free cell is covered exactly once
// by the right piece, walls and date cells are respected, and each piece's
// shape matches one of its mask orientations.
const verifySolution = (type: PuzzleType, date: DateInput) => {
  const solutions = solve(type, buildBoard(type, date))
  expect(solutions.length).toBeGreaterThan(0)

  const { itemMasks } = getItemMasksAndFirstXCols(type)
  const board = formatSolution(type, solutions[0])

  expect(board.flat().filter((c) => c === null).length).toBe(wallCount(type))
  expect(board.flat().filter((c) => c === ".").length).toBe(dateCellCount(type))
  expect(board.flat().filter((c) => c !== null && c !== ".").length).toBe(
    totalPieceCells(type)
  )

  for (let piece = 0; piece < itemMasks.length; piece++) {
    const cells: { row: number; col: number }[] = []
    board.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell === piece.toString()) cells.push({ row: r, col: c })
      })
    )

    expect(cells).toHaveLength(cellCount(items[type][piece]))

    // Normalize the occupied cells to a bounding-box grid and match against
    // the piece's mask orientations.
    const minRow = Math.min(...cells.map((c) => c.row))
    const minCol = Math.min(...cells.map((c) => c.col))
    const height = Math.max(...cells.map((c) => c.row)) - minRow + 1
    const width = Math.max(...cells.map((c) => c.col)) - minCol + 1
    const shape = Array.from({ length: height }, () => Array(width).fill("."))
    cells.forEach(({ row, col }) => (shape[row - minRow][col - minCol] = "x"))
    const normalized = shape.map((row) => row.join(""))

    expect(itemMasks[piece]).toContainEqual(normalized)
  }
}

describe("computeItemMasks", () => {
  it.each(["DEFAULT", "STANDARD"] as const)(
    "%s pieces have 1–8 unique orientations with consistent rows",
    (type) => {
      const masks = computeItemMasks(type)

      for (const orientations of masks) {
        expect(orientations.length).toBeGreaterThan(0)
        expect(orientations.length).toBeLessThanOrEqual(8)

        // Each orientation is a valid rectangular grid (rotation swaps
        // width/height, so only compare rows *within* an orientation).
        for (const orientation of orientations) {
          const width = orientation[0].length
          for (const row of orientation) {
            expect(row.length).toBe(width)
          }
        }
      }
    }
  )

  it("firstXCols has an entry per orientation", () => {
    for (const type of ["DEFAULT", "STANDARD"] as const) {
      const { itemMasks, firstXCols } = getItemMasksAndFirstXCols(type)
      expect(firstXCols).toHaveLength(itemMasks.length)
      itemMasks.forEach((pieceMasks, i) => {
        expect(firstXCols[i]).toHaveLength(pieceMasks.length)
      })
    }
  })
})

describe("getDateCells", () => {
  it("maps months to the top two rows", () => {
    const cells = (month: number) => getDateCells("DEFAULT", { month, day: 1, weekday: 0 }).month
    expect(cells(0)).toEqual({ row: 0, col: 0 })
    expect(cells(6)).toEqual({ row: 1, col: 0 })
    expect(cells(11)).toEqual({ row: 1, col: 5 })
  })

  it("maps days starting at row 2", () => {
    const cells = (day: number) => getDateCells("DEFAULT", { month: 0, day, weekday: 0 }).day
    expect(cells(1)).toEqual({ row: 2, col: 0 })
    expect(cells(7)).toEqual({ row: 2, col: 6 })
    expect(cells(8)).toEqual({ row: 3, col: 0 })
    expect(cells(31)).toEqual({ row: 6, col: 2 })
  })

  it("maps weekdays only for STANDARD", () => {
    expect(getDateCells("DEFAULT", { month: 0, day: 1, weekday: 0 }).weekday).toBeUndefined()
    const cells = (weekday: number) =>
      getDateCells("STANDARD", { month: 0, day: 1, weekday }).weekday
    expect(cells(0)).toEqual({ row: 6, col: 3 })
    expect(cells(3)).toEqual({ row: 6, col: 6 })
    expect(cells(4)).toEqual({ row: 7, col: 4 })
    expect(cells(6)).toEqual({ row: 7, col: 6 })
  })
})

describe("buildBoard", () => {
  it.each(["DEFAULT", "STANDARD"] as const)(
    "%s blocks the walls plus the date cells",
    (type) => {
      const board = buildBoard(type, { month: 0, day: 1, weekday: 3 })
      const blocked = board.flat().filter((c) => c === "x").length
      expect(blocked).toBe(wallCount(type) + dateCellCount(type))
    }
  )
})

describe("solve", () => {
  it("solves DEFAULT dates", () => {
    for (const date of [
      { month: 0, day: 1, weekday: 0 },
      { month: 5, day: 15, weekday: 3 },
      { month: 11, day: 31, weekday: 6 },
    ]) {
      verifySolution("DEFAULT", date)
    }
  })

  it("solves STANDARD dates across all weekdays", () => {
    for (let weekday = 0; weekday < 7; weekday++) {
      verifySolution("STANDARD", { month: 0, day: 1, weekday })
    }
  })
})
