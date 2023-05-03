import * as React from 'react'
import styles from './styles.module.css'
import * as ReactDOMClient from 'react-dom/client'

export function hookUp(hud: HTMLDivElement) {
  const hudRoot = ReactDOMClient.createRoot(hud)
  hudRoot.render(<ExampleComponent text='testing' />)
}

interface Props {
  text: string
}

export const ExampleComponent = ({ text }: Props) => {
  return <div className={styles.test}>Example Component: {text}</div>
}

export function hello() {
  console.log('hello')
}
