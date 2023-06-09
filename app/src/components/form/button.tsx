import classNames from "classnames";
import React from "react";
import { Loading } from "../loading/Loading";

type PrimaryButtonProps = React.ComponentPropsWithoutRef<"button"> & { loading?: boolean }

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button className={classNames('min-w-[120px] flex justify-center px-4 py-1 bg-black border border-transparent rounded-md shadow-md hover:bg-gray-800 text-white disabled:bg-gray-700 items-center', className)} {...rest}>
      {loading ? <Loading /> : children}
    </button>
  )
}

export default PrimaryButton


export const SecondaryButton: React.FC<PrimaryButtonProps> = ({ children, className, ...rest }) => {

  return (
    <button className={classNames('min-w-[120px] px-4 py-1 border border-black   rounded-md shadow-md hover:bg-zinc-100 flex items-center ', className)} {...rest}>
      {children}
    </button>
  )
}


export const SmallButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button
      className={classNames('min-w-[120px] flex justify-center p-0.5 px-4 border bg-black text-sm  border-transparent rounded-md shadow-md hover:bg-gray-700 text-white items-center', className)}
      {...rest}
    >
      {loading ? <Loading height={20} width={20} /> : children}
    </button>
  )
}

export const SmallSecondaryButton: React.FC<PrimaryButtonProps> = ({ children, className, loading, ...rest }) => {

  return (
    <button
      className={classNames('min-w-[120px] flex justify-center p-0.5 px-4 border bg-white text-sm  border-black rounded-md shadow-md hover:bg-zinc-100  items-center', className)}
      {...rest}
    >
      {loading ? <Loading height={20} width={20} /> : children}
    </button>
  )
}

