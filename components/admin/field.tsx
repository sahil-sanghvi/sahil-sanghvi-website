/**
 * Shared labeled-input building block for admin forms. Every admin page
 * before this hand-wrote the same `<label>` + `<input className="border-…">`
 * pair (~40 repetitions of one className string) — this is the first
 * extraction, used by the new edit forms; existing create forms are left
 * alone and can migrate opportunistically. Plain server component, no
 * client interactivity.
 */
const INPUT_CLASS =
  "border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none";

type CommonProps = {
  label: string;
  name: string;
  id?: string;
  required?: boolean;
  className?: string;
};

export function Field({
  label,
  name,
  id,
  required,
  className,
  type = "text",
  defaultValue,
  placeholder,
}: CommonProps & {
  type?: "text" | "date";
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const fieldId = id ?? name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-flag text-muted-foreground">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className={`${INPUT_CLASS} ${className ?? ""}`}
      />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  id,
  required,
  className,
  rows = 3,
  defaultValue,
}: CommonProps & { rows?: number; defaultValue?: string | null }) {
  const fieldId = id ?? name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-flag text-muted-foreground">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className={`${INPUT_CLASS} ${className ?? ""}`}
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  id,
  required,
  className,
  options,
  defaultValue,
}: CommonProps & { options: string[]; defaultValue?: string | null }) {
  const fieldId = id ?? name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-flag text-muted-foreground">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={`${INPUT_CLASS} max-w-xs ${className ?? ""}`}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  id,
  defaultChecked,
}: {
  label: string;
  name: string;
  id?: string;
  defaultChecked?: boolean;
}) {
  const fieldId = id ?? name;
  return (
    <label htmlFor={fieldId} className="text-flag text-muted-foreground flex items-center gap-2">
      <input id={fieldId} type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
