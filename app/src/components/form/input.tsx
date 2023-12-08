import { forwardRef } from "react";

type InputProps = Omit<JSX.IntrinsicElements["input"], "name"> & { name?: string, error?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return (
    <>
      <input
        {...props}
        ref={ref}
        className={`w-full p-2 rounded-md border border-gray-300 focus:border-gray-800 outline-none ${props.className ?? ''}`}
      />
      <p className="mt-1 text-sm text-red-400">{props.error ?? ''}</p>
    </>
  );
});

type TextAreaProps = Omit<JSX.IntrinsicElements["textarea"], "name"> & { name: string, error?: string };


export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(props, ref) {
  return (
    <>
      <textarea
        {...props}
        ref={ref}
        className={`w-full p-2 rounded-md border border-gray-300 focus:border-gray-800 outline-none`}
      />
      <p className="mt-1 text-sm text-red-400 h-2">{props.error ?? ''}</p>
    </>
  );
});

export function Label(props: JSX.IntrinsicElements["label"] & { link?: string }) {
  return (
    <label {...props} className={`block text-zinc-600 ml-1 mb-1 ${props?.className || ''}`}>
      <span>  {props.children} </span>
      <p>
        {props.title ? <span className="font-light text-xs mb-0 text-zinc-500"> {props.title}</span> : null}
        {props.link ? <a className="font-light inline text-xs mb-0 text-zinc-500 underline" target='_blank' href={props.link} rel="noreferrer"> Learn more</a> : null}
      </p>
    </label>
  );
}


type SelectProps = Omit<JSX.IntrinsicElements["select"], "name"> & { name?: string, error?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Input(props, ref) {
  return (
    <>
      <select
        {...props}
        ref={ref}
        className={`w-full p-2 rounded-md border border-gray-300 focus:border-gray-800 outline-none`}
      />
      <p className="mt-1 text-sm text-red-400">{props.error ?? ''}</p>
    </>
  );
});

