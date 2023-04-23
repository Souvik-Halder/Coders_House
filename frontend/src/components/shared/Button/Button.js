
import React from 'react'
import styles from './Button.module.css'
function Button({text,icon,onClick}) {
  return (
    <button onClick={onClick} className={styles.button}>
        <span>{text}</span>
        <img className={styles.arrow} src={`/images/${icon}.png`} alt='icon'/>
    </button>
  )
}

export default Button

