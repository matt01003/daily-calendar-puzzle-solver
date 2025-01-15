import { uniqBy } from "lodash"

export type PuzzleType = "DEFAULT" | "STANDARD"
export type Item = string[]
export type Board = (string | null)[][]

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

export const puzzleDimensions: any = {
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

export const computeItemMasks = (category: string): Item[][] => {
  const categoryItems = items[category as keyof typeof items]

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

export const getItemMasksAndFirstXCols = (category: string) => {
  const itemMasks = computeItemMasks(category)
  const firstXCols = computeFirstXCols(itemMasks)
  return { itemMasks, firstXCols }
}

const placeOrRemove = (
  board: Board,
  index: number,
  itemIndex: number,
  maskIndex: number,
  mark: string | null,
  itemMasks: Item[][],
  firstXCols: number[][]
) => {
  const row = Math.floor(index / 7)
  const col = index % 7
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
  firstXCols: number[][]
): boolean => {
  const row = Math.floor(index / 7)
  const col = index % 7

  const mask = itemMasks[itemIndex][maskIndex]
  const firstXCol = firstXCols[itemIndex][maskIndex]

  if (
    row + mask.length > board.length ||
    col - firstXCol < 0 ||
    col + mask[0].length - firstXCol > 7
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
  const board = puzzleByType[type].map((row) => row.split(""))
  solution.forEach(({ index, maskIndex }, itemIndex) => {
    placeOrRemove(
      board,
      index,
      itemIndex,
      maskIndex,
      itemIndex.toString(),
      itemMasks,
      firstXCols
    )
  })
  return board.map((row) => row.map((e) => (e === "x" ? null : e)))
}

export const createBoard = (
  type: PuzzleType,
  date: { month: number; day: number; weekday: number }
) => {
  const { itemMasks, firstXCols } = getItemMasksAndFirstXCols(type)
  const board = puzzleByType[type].map((row) => row.split(""))
  const { ROWS, COLS } = puzzleDimensions[type]
  const { month, day, weekday } = date

  board[Math.floor(month / 6)][month % 6] = "x"
  board[Math.floor((day - 1) / 7) + 2][(day - 1) % 7] = "x"
  if (type === "STANDARD") {
    board[weekday > 3 ? 7 : 6][weekday > 3 ? weekday : weekday + 3] = "x"
  }

  const solve = () => {
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
            if (canPlace(board, index, i, j, itemMasks, firstXCols)) {
              placeOrRemove(board, index, i, j, "x", itemMasks, firstXCols)
              solution[i] = { index, maskIndex: j }
              dfs(index + 1)
              solution[i] = null
              placeOrRemove(board, index, i, j, null, itemMasks, firstXCols)
            }
          }
        }
      }
    }

    dfs(0)
    return solutions
  }

  return {
    board,
    solve,
  }
}
