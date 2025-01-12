import { ReactNode } from "react"
import styles from "./style.module.scss"

type Props = {
  children: ReactNode
  style?: React.CSSProperties
  disabled?: boolean
  onClick: Function
}

export default function Button(props: Props) {
  const { children, style, disabled, onClick } = props
  return (
    <button
      className={styles.button}
      style={style}
      disabled={disabled}
      onClick={() => onClick()}
    >
      {children}
    </button>
  )
}
