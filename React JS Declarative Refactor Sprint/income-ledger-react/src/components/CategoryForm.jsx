import InputField from "./InputField.jsx";

/**
 * The registration card from the Midterm (form#categoryForm), plus the amount field.
 * It owns no state: values come from App as props, and every change is
 * sent back up through the onChange / onSubmit callbacks.
 */
export default function CategoryForm({ values, errors, onChange, onSubmit, inputRefs }) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header card-header-brand py-3">
        <h2 className="h5 mb-0 fw-bold">Income Category Registration</h2>
      </div>
      <div className="card-body p-4">
        {/* type="submit" + onSubmit: clicking Save OR pressing Enter both add a category */}
        <form id="categoryForm" noValidate onSubmit={onSubmit}>
          <InputField
            id="txtCatName"
            label="Category Name"
            placeholder="e.g., Consulting"
            value={values.name}
            error={errors.name}
            onChange={(value) => onChange("name", value)}
            inputRef={inputRefs.name}
          />
          <InputField
            id="txtCatDesc"
            label="Description"
            placeholder="e.g., Enterprise technical support contract"
            value={values.desc}
            error={errors.desc}
            onChange={(value) => onChange("desc", value)}
            inputRef={inputRefs.desc}
          />
          <InputField
            id="txtCatAmount"
            label="Expected Monthly Amount"
            placeholder="e.g., 15000.00"
            prefix="₱"
            inputMode="decimal"
            value={values.amount}
            error={errors.amount}
            onChange={(value) => onChange("amount", value)}
            inputRef={inputRefs.amount}
          />
          <button type="submit" id="btnAdd" className="btn btn-accent px-4 fw-semibold">
            Save Category
          </button>
        </form>
      </div>
    </div>
  );
}
