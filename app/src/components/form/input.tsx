import { type DetailedHTMLProps, forwardRef, type TextareaHTMLAttributes } from "react";

type InputProps = Omit<JSX.IntrinsicElements["input"], "name"> & { name?: string, error?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return (
    <>
      <input
        {...props}
        ref={ref}
        className={`w-full p-2 rounded-md border border-gray-300 focus:border-gray-800 outline-none`}
      />
      <p className="mt-1 text-sm text-red-400 h-2">{props.error ?? ''}</p>
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

export function Label(props: JSX.IntrinsicElements["label"]) {
  return (
    <label {...props} className={`block text-zinc-500 ml-1 mb-1 ${props?.className || ''}`}>
      {props.children}
    </label>
  );
}

