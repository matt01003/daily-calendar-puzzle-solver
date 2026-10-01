import { uniqBy } from "lodash"

export type PuzzleType = "DEFAULT" | "STANDARD"
export type Item = string[]
export type Board = (string | null)[][]

export type PuzzleDate = { month: number; day: number; weekday: number }
export type PuzzleDimensions = { ROWS: number; COLS: number }

export const puzzleByType: Record<PuzzleType, string[]> = {
  DEFAULT: [
    "......x",
    "......x",
    ".......",
    ".......",
    ".......",
    ".......",
    "...xxxx",
  ],
  STANDARD: [
    "......x",
    "......x",
    ".......",
    ".......",
    ".......",
    ".......",
    ".......",
    "xxxx...",
  ],
}

export const puzzleDimensions: Record<PuzzleType, PuzzleDimensions> = {
  DEFAULT: { ROWS: 7, COLS: 7 },
  STANDARD: { ROWS: 8, COLS: 7 },
}

export const items = {
  DEFAULT: [
    ["x...", "xxxx"],
    ["x..", "xxx", "..x"],
    ["..xx", "xxx."],
    ["xxxx", "..x."],
    [".xx", "xxx"],
    ["xxx", "x.x"],
    ["xxx", "xxx"],
    ["x..", "x..", "xxx"],
  ],

  STANDARD: [
    ["x...", "xxxx"],
    ["x..", "xxx", "..x"],
    ["..xx", "xxx."],
    ["x", "x", "x", "x"],
    [".xx", "xxx"],
    ["xxx", "x.x"],
    ["xxx", "..x"],
    [".xx", "xx."],
    ["x..", "xxx", "x.."],
    ["x..", "x..", "xxx"],
  ],
}

const rotate = (item: Item): Item => {
  return item[0].split("").map((_, colIndex) =>
    item
      .map((row) => row[colIndex])
      .reverse()
      .join("")
  )
}

const flip = (item: Item): Item => {
  return item.map((row) => row.split("").reverse().join(""))
}

export const computeItemMasks = (category: PuzzleType): Item[][] => {
  const categoryItems = items[category]

  return categoryItems.map((item) => {
    const transformations: Item[] = [item]
    for (let i = 1; i < 4; i++) {
      transformations.push(rotate(transformations[i - 1]))
    }
    for (let i = 0; i < 4; i++) {
      transformations.push(flip(transformations[i]))
    }
    return uniqBy(transformations, (x) => x.join("\n"))
  })
}

export const computeFirstXCols = (itemMasks: Item[][]): number[][] => {
  return itemMasks.map((masks) => masks.map((mask) => mask[0].indexOf("x")))
}

export const getItemMasksAndFirstXCols = (category: PuzzleType) => {
  const itemMasks = computeItemMasks(category)
  const firstXCols = computeFirstXCols(itemMasks)
  return { itemMasks, firstXCols }
}

type Cell = { row: number; col: number }

// Single source of truth for where the month/day/weekday labels live on the
// board. The offsets below are geometric facts of this calendar layout and
// must stay in sync with the index mapping in `useBoard.updateDate` and the
// rendering offsets in `Board/index.tsx`.
export const getDateCells = (
  type: PuzzleType,
  date: PuzzleDate
): { month: Cell; day: Cell; weekday?: Cell } => {
  const { month, day, weekday } = date

  return {
    month: { row: Math.floor(month / 6), col: month % 6 },
    day: { row: Math.floor((day - 1) / 7) + 2, col: (day - 1) % 7 },
    weekday:
      type === "STANDARD"
        ? { row: weekday > 3 ? 7 : 6, col: weekday > 3 ? weekday : weekday + 3 }
        : undefined,
  }
}

const placeOrRemove = (
  board: Board,
  index: number,
  itemIndex: number,
  maskIndex: number,
  mark: string | null,
  itemMasks: Item[][],
  firstXCols: number[][],
  COLS: number
) => {
  const row = Math.floor(index / COLS)
  const col = index % COLS
  const mask = itemMasks[itemIndex][maskIndex]
  const firstXCol = firstXCols[itemIndex][maskIndex]

  mask.forEach((maskRow, r) => {
    maskRow.split("").forEach((cell, c) => {
      if (cell === "x") {
        board[row + r][col + c - firstXCol] = mark ?? "."
      }
    })
  })
}

const canPlace = (
  board: Board,
  index: number,
  itemIndex: number,
  maskIndex: number,
  itemMasks: Item[][],
  firstXCols: number[][],
  COLS: number
): boolean => {
  const row = Math.floor(index / COLS)
  const col = index % COLS

  const mask = itemMasks[itemIndex][maskIndex]
  const firstXCol = firstXCols[itemIndex][maskIndex]

  if (
    row + mask.length > board.length ||
    col - firstXCol < 0 ||
    col + mask[0].length - firstXCol > COLS
  ) {
    return false
  }

  return mask.every((maskRow, r) =>
    maskRow.split("").every((cell, c) => {
      if (cell === "x") {
        const boardCell = board[row + r][col + c - firstXCol]
        if (boardCell === "x") return false
      }
      return true
    })
  )
}

export const formatSolution = (
  type: PuzzleType,
  solution: { index: number; maskIndex: number }[]
): Board => {
  const { itemMasks, firstXCols } = getItemMasksAndFirstXCols(type)
  const { COLS } = puzzleDimensions[type]
  const board = puzzleByType[type].map((row) => row.split(""))
  solution.forEach(({ index, maskIndex }, itemIndex) => {
    placeOrRemove(
      board,
      index,
      itemIndex,
      maskIndex,
      itemIndex.toString(),
      itemMasks,
      firstXCols,
      COLS
    )
  })
  return board.map((row) => row.map((e) => (e === "x" ? null : e)))
}

// Builds the wall layout with the given date's month/day/weekday cells marked
// as blocked ("x"). Pieces may not be placed on any "x" cell.
export const buildBoard = (type: PuzzleType, date: PuzzleDate): Board => {
  const board = puzzleByType[type].map((row) => row.split(""))
  const { month, day, weekday } = getDateCells(type, date)

  board[month.row][month.col] = "x"
  board[day.row][day.col] = "x"
  if (weekday) {
    board[weekday.row][weekday.col] = "x"
  }

  return board
}

// Depth-first backtracking search over the given board (mutated in place,
// restored on return). Returns up to 10 solutions for STANDARD, unbounded for
// DEFAULT.
export const solve = (
  type: PuzzleType,
  board: Board
): { index: number; maskIndex: number }[][] => {
  const { itemMasks, firstXCols } = getItemMasksAndFirstXCols(type)
  const { ROWS, COLS } = puzzleDimensions[type]
  const solutions: { index: number; maskIndex: number }[][] = []
  const solution: ({ index: number; maskIndex: number } | null)[] =
    itemMasks.map(() => null)
  let foundSolutions = 0

  const dfs = (index: number) => {
    if (foundSolutions >= 10 && type === "STANDARD") return

    if (index >= ROWS * COLS) {
      solutions.push(solution.map((s) => s!))
      foundSolutions++
      return
    }

    const row = Math.floor(index / COLS)
    const col = index % COLS

    if (board[row][col] === "x") {
      dfs(index + 1)
      return
    }

    for (let i = 0; i < itemMasks.length; i++) {
      if (!solution[i]) {
        for (let j = 0; j < itemMasks[i].length; j++) {
          if (canPlace(board, index, i, j, itemMasks, firstXCols, COLS)) {
            placeOrRemove(board, index, i, j, "x", itemMasks, firstXCols, COLS)
            solution[i] = { index, maskIndex: j }
            dfs(index + 1)
            solution[i] = null
            placeOrRemove(board, index, i, j, null, itemMasks, firstXCols, COLS)
          }
        }
      }
    }
  }

  dfs(0)
  return solutions
}
