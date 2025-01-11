import { ReactNode } from "react"
import styles from "./style.module.scss"

type Props = {
  children: ReactNode
  disabled?: boolean
  onClick: Function
}

export default function Button(props: Props) {
  const { children, disabled, onClick } = props
  return (
    <button
      disabled={disabled}
      className={styles.button}
      onClick={() => onClick()}
    >
      {children}
    </button>
  )
}
