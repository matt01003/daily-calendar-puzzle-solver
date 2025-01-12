import { uniqBy } from "lodash"

export type PuzzleType = "DEFAULT" | "CENTER"

export type BoardType = {
  DEFAULT: string[]
  CENTER: string[]
}

export const boardType: BoardType = {
  DEFAULT: [
    "......x",
    "......x",
    ".......",
    ".......",
    ".......",
    ".......",
    "...xxxx",
  ],
  CENTER: [
    "x.....x",
    ".......",
    ".......",
    ".......",
    ".......",
    ".......",
    "...xxxx",
  ],
}

export const ROWS = 7
export const COLS = 7

export const items = [
  ["x...", "xxxx"],
  ["x..", "xxx", "..x"],
  ["..xx", "xxx."],
  ["xxxx", "..x."],
  [".xx", "xxx"],
  ["xxx", "x.x"],
  ["xxx", "xxx"],
  ["x..", "x..", "xxx"],
]

const rotate = (item: string[]): string[] => {
  return item[0].split("").map((_, colIndex) =>
    item
      .map((row) => row[colIndex])
      .reverse()
      .join("")
  )
}

const flip = (item: string[]): string[] => {
  return item.map((row) => row.split("").reverse().join(""))
}

export const itemMasks = items.map((item) => {
  const transformations: string[][] = [item]
  for (let i = 1; i < 4; i++) {
    transformations.push(rotate(transformations[i - 1]))
  }
  for (let i = 0; i < 4; i++) {
    transformations.push(flip(transformations[i]))
  }
  return uniqBy(transformations, (x) => x.join("\n"))
})

export const firstXCols = itemMasks.map((masks) =>
  masks.map((mask) => mask[0].indexOf("x"))
)

const placeOrRemove = (
  board: string[][],
  index: number,
  itemIndex: number,
  maskIndex: number,
  mark: string | null
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
  board: string[][],
  index: number,
  itemIndex: number,
  maskIndex: number
): boolean => {
  const row = Math.floor(index / COLS)
  const col = index % COLS
  const mask = itemMasks[itemIndex][maskIndex]
  const firstXCol = firstXCols[itemIndex][maskIndex]

  if (
    row + mask.length > ROWS ||
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
): string[][] => {
  const board = boardType[type].map((row) => row.split(""))
  solution.forEach(({ index, maskIndex }, itemIndex) => {
    placeOrRemove(board, index, itemIndex, maskIndex, itemIndex.toString())
  })
  return board
}

export const createBoard = (type: PuzzleType, month: number, day: number) => {
  const board = boardType[type].map((row) => row.split(""))

  if (type === "DEFAULT") {
    board[Math.floor(month / 6)][month % 6] = "x"
  } else {
    if (month < 5) {
      board[0][month + 1] = "x"
    } else {
      board[1][month - 5] = "x"
    }
  }
  board[Math.floor((day - 1) / 7) + 2][(day - 1) % 7] = "x"

  const solve = () => {
    const solutions: { index: number; maskIndex: number }[][] = []
    const solution: ({ index: number; maskIndex: number } | null)[] = items.map(
      () => null
    )

    const dfs = (index: number) => {
      if (index >= ROWS * COLS) {
        solutions.push(solution.map((s) => s!))
        return
      }

      const row = Math.floor(index / COLS)
      const col = index % COLS

      if (board[row][col] === "x") {
        dfs(index + 1)
        return
      }

      for (let i = 0; i < items.length; i++) {
        if (!solution[i]) {
          for (let j = 0; j < itemMasks[i].length; j++) {
            if (canPlace(board, index, i, j)) {
              placeOrRemove(board, index, i, j, "x")
              solution[i] = { index, maskIndex: j }
              dfs(index + 1)
              solution[i] = null
              placeOrRemove(board, index, i, j, null)
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
