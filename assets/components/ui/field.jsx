import React from "react"
import { cn } from "@/lib/utils"

export function FieldGroup({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

export function Field({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

export function FieldLabel({ className, ...props }) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FieldSeparator({ className, children, ...props }) {
  return (
    <div
      className={cn("relative flex items-center gap-4", className)}
      {...props}
    >
      <div className="h-px flex-1 bg-border" data-slot="field-separator-content" />
      {children && (
        <>
          <span className="text-xs text-muted-foreground">{children}</span>
          <div className="h-px flex-1 bg-border" data-slot="field-separator-content" />
        </>
      )}
    </div>
  )
}
