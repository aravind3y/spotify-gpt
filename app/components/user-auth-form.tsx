"use client"

import * as React from "react"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}


export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Button asChild disabled={isLoading} variant="secondary">
        <Link href={'/api/authenticate'} onClick={() => setIsLoading(true)}>
        {isLoading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Image
              height={20}
              width={20}
              src={require('./spotify_icon.png')}
              alt="Spotify Logo"
              className="mr-2 h-4 w-4"
            />
        )}
        Login with Spotify
        </Link>
      </Button>
    </div>
  )
}