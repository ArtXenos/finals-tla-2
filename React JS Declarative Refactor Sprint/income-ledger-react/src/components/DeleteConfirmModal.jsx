/**
 * Asks "are you sure?" before deleting.
 * Uses Bootstrap's modal look, but React decides when it shows:
 * App renders it only while pendingDelete is not null.
 */
export default function DeleteConfirmModal({ pending, totalCount, onConfirm, onCancel }) {
  const isAll = pending.mode === "all";

  return (
    <>
      <div
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deleteModalTitle"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      >
        {/* stopPropagation: clicks inside the box don't count as "outside" */}
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h2 id="deleteModalTitle" className="modal-title h5 text-brand">
                {isAll ? "Delete all categories?" : "Delete category?"}
              </h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} />
            </div>
            <div className="modal-body">
              {isAll ? (
                <>All <strong>{totalCount}</strong> categories will be removed. This can't be undone.</>
              ) : (
                <><strong>{pending.category.name}</strong> will be removed from the ledger.</>
              )}
            </div>
            <div className="modal-footer">
              {/* Cancel gets focus first, so an accidental Enter doesn't delete */}
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} autoFocus>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>
                {isAll ? "Delete All" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
