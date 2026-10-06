import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] font-Regular uppercase tracking-[0.1em] text-[#0B0F0B]">
      {children}
    </label>
  );
}

const fieldBase =
  'w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-label/70 outline-none transition focus:border-brand  focus:ring-brand/20';

export function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function FieldTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldBase, 'resize-y', props.className)} />;
}

export function FieldSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(fieldBase, 'appearance-none pr-10', props.className)} />
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-label"
      />
    </div>
  );
}

export function FieldGroup({ full, children }: { full?: boolean; children: ReactNode }) {
  return <div className={cn(full && 'md:col-span-2')}>{children}</div>;
}
