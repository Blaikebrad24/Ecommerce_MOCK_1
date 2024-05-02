'use client'

import { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Nav({children}: {children: ReactNode}) {
  return <nav className='bg-primary text-primary-foreground flex justify-center px-4'>
    {children}
    </nav>
}

// ComponentProps will get all of the props within <Link>
// Omit the classname props because we do not want to add classname to it 
export function NavLink( props: Omit<ComponentProps<typeof Link>, "className">){
    const pathname = usePathname();
    return <Link {...props} className={cn(`p-4 hover:bg-secondary 
                                        hover:text-secondary-foreground 
                                        focus-visible:bg-secondary 
                                        focus-visible:text-secondary-foreground`
            , pathname === props.href && "bg-background text-foreground")}/> 
}

