/**
 * A text input with a label and an inline error message.
 * Used in the registration form and in the edit row.
 * When `error` has text, Bootstrap's "is-invalid" class turns the border red
 * and shows the message. This replaces the Midterm's alert().
 * `prefix` (e.g. "₱") shows a small box in front of the input.
 */
export default function InputField({
  id,
  label,
  value,
  error,
  onChange,
  inputRef,
  placeholder = "",
  prefix = "",
  inputMode = "text",
  small = false,
  hideLabel = false,
  autoFocus = false,
}) {
  const classes = ["form-control"];
  if (small) classes.push("form-control-sm");
  if (error) classes.push("is-invalid");

  const input = (
    <input
      ref={inputRef}
      type="text"
      inputMode={inputMode}
      id={id}
      className={classes.join(" ")}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      autoFocus={autoFocus}
    />
  );

  const feedback = error && (
    <div id={`${id}-error`} className="invalid-feedback">
      {error}
    </div>
  );

  return (
    <div className={small ? "" : "mb-3"}>
      <label htmlFor={id} className={hideLabel ? "visually-hidden" : "form-label fw-semibold"}>
        {label}
      </label>
      {prefix ? (
        <div className={`input-group has-validation${small ? " input-group-sm" : ""}`}>
          <span className="input-group-text">{prefix}</span>
          {input}
          {feedback}
        </div>
      ) : (
        <>
          {input}
          {feedback}
        </>
      )}
    </div>
  );
}
