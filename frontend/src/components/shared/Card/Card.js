import React from 'react'
import styles from './Card.module.css'


//children gives you the special types of props used to display the content written between the two braces of the component just like <Component>Content</Component>
function Card({title,icon,children}) {
  return (
    <div className={styles.card}>
     <div className={styles.headingWrapper}>
      <img src={`/images/${icon}.png`}alt="logo" />
      <h1 className={styles.heading}>{title}</h1>

     </div>
    {children}
    </div>
  )
}

export default Card
