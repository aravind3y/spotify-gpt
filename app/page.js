'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'
import Link from "next/link"
import styles from './styles.module.css'

export default function Home() {
  const [message, setMessage] = useState('');
  return (
    <>
    <p>Home</p>
    <Button className={styles.authenticate} asChild>
      <Link href="/api/authenticate">
        Login
      </Link>
    </Button>
    {message}
    </>
  )
}
