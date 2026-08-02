/**
 * PayRoll Pro – FormInput Component
 * Reusable form input wrapper with label, validation feedback, and optional icon.
 */

import { Form } from 'react-bootstrap';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  as, // 'textarea', 'select' etc.
  children, // for select options
  disabled = false,
  min,
  max,
  step,
  rows,
}) => {
  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      <Form.Control
        as={as}
        type={as ? undefined : type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isInvalid={!!error}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        rows={rows}
        className={as === 'select' ? 'form-select' : 'form-control'}
      >
        {children}
      </Form.Control>
      <Form.Control.Feedback type="invalid" className="invalid-feedback">
        {error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default FormInput;
