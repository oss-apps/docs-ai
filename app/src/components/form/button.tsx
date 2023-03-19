import classNames from "classnames";
import React from "react";

type PrimaryButtonProps = React.ComponentPropsWithoutRef<"button">

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className, ...rest }) => {

  return (
    <button className={classNames('flex justify-center px-4 py-1 bg-black border border-transparent rounded-md shadow-md hover:bg-gray-700 text-white', className)} {...rest}>
      {children}
    </button>
  )
}

export default PrimaryButton


export const SecondaryButton: React.FC<PrimaryButtonProps> = ({ children, className, ...rest }) => {

  return (
    <button className={classNames('px-4 py-1 border border-transparent rounded-md shadow-md hover:bg-gray-100', className)} {...rest}>
      {children}
    </button>
  )
}


export const SmallButton: React.FC<PrimaryButtonProps> = ({ children, className, ...rest }) => {

  return (
    <button
      className={classNames('p-0.5 px-4 border bg-black text-sm  border-transparent rounded-md shadow-md hover:bg-gray-700 text-white', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

