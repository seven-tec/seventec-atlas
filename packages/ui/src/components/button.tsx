import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md border border-accent bg-accent px-4 py-2 text-background ${className}`}
      {...props}
    />
  );
}

