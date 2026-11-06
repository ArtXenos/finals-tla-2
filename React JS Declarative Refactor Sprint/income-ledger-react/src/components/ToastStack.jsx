/**
 * Success messages in the bottom-right corner.
 * App adds a message to the `toasts` array and removes it after 3 seconds;
 * this component just draws whatever is in the array.
 * aria-live="polite" makes screen readers announce new messages.
 */
export default function ToastStack({ toasts, onClose }) {
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast show toast-success" role="status">
          <div className="d-flex align-items-center">
            <div className="toast-body">
              <span className="toast-check" aria-hidden="true">✓</span> {toast.message}
            </div>
            <button
              type="button"
              className="btn-close me-2 m-auto"
              aria-label="Close"
              onClick={() => onClose(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
