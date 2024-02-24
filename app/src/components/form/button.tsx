import classNames from "classnames";
import React from "react";
import { Loading } from "../loading/Loading";
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~/lib/utils"
import { toast } from "react-hot-toast";
import { env } from "~/env.mjs";

type PrimaryButtonProps = React.ComponentPropsWithoutRef<"button"> & { loading?: boolean }

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button className={classNames('min-w-[120px]  flex justify-center px-4 py-2  bg-black border  rounded-md shadow-md hover:bg-gray-800 text-white disabled:bg-gray-700 items-center  duration-200 ', className)} {...rest}>
      {loading ? <Loading /> : children}
    </button>
  )
}

export default PrimaryButton


export const CustomButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button className={classNames('px-1.5 lg:min-w-[120px]  flex justify-center lg:px-4 py-2   rounded-lg items-center  duration-200 ', className)} {...rest}>
      {loading ? <Loading /> : children}
    </button>
  )
}


export const SecondaryButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button className={classNames('px-1.5 lg:min-w-[120px]  lg:px-4 py-2 border border-slate-500  rounded-md  hover:bg-zinc-100 flex items-center   duration-200 ', className)} {...rest}>
      {loading ? <Loading /> : children}
    </button>
  )
}


export const SmallButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button
      className={classNames('min-w-[120px] flex justify-center p-0.5 px-4 border bg-black text-sm  border-transparent rounded-md shadow-md hover:bg-gray-700 text-white items-center  duration-200', className)}
      {...rest}
    >
      {loading ? <Loading height={20} width={20} /> : children}
    </button>
  )
}

export const SmallSecondaryButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button
      className={classNames('min-w-[120px] flex justify-center p-0.5 px-4 border bg-white text-sm  border-black rounded-md shadow-md hover:bg-zinc-100  items-center  duration-200', className)}
      {...rest}
    >
      {loading ? <Loading height={20} width={20} /> : children}
    </button>
  )
}

export const ShareButton: React.FC<{ id: string | undefined, title: string | undefined, icon: any, className?: string }> = ({ id, title, icon, className = "" }) => {
  const handleCopy = async () => {
    if (!id) return
    const url = `${env.NEXT_PUBLIC_DOMAIN}/convo/${id}`
    try {
      await navigator.share({
        title: title || "Sharing your conversation",
        text: title,
        url
      })
    }
    catch (err) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success(`Link copied to clipboard`, { position: 'top-center' })
      }).catch(console.error)
    }
  }

  return (<>
    <button onClick={handleCopy} className={className}>
      {icon}</button>
  </>)
}




export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md  font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"



