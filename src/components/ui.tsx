import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, subtitle, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 animate-scale-in">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h3 className="text-lg font-bold text-navy-800">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
};

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20';

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputClass} min-h-[80px] resize-y leading-relaxed ${className}`}
      {...props}
    />
  );
}

type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  required?: boolean;
};

export function DateInput({ value, onChange, name, id, required }: DateInputProps) {
  return (
    <input
      id={id}
      name={name}
      type="date"
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
  };
  const variants: Record<string, string> = {
    primary: 'bg-navy-800 text-white hover:bg-navy-700 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    ghost: 'text-slate-600 hover:bg-slate-100',
    gold: 'bg-gold-500 text-white hover:bg-gold-400 shadow-sm hover:shadow-md',
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-navy-700" />
      {label && <span className="text-sm text-slate-400">{label}</span>}
    </div>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
          {icon}
        </div>
      )}
      <p className="max-w-xs text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد الحذف',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      <div className="mt-6 flex justify-start gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
