
import React from 'react';
import { useValidate, useValidator } from 'react-admin-base';
import { FormattedMessage } from "react-intl";
import { Alert, FormFeedback } from "reactstrap";

function ValidatorCore(name: string, value: any, type: any, children: any) {
    const error = useValidate(name || '', value, type);
    
    return <>
        {(error 
            && React.cloneElement(children, { invalid: !!error, className: (children.props.className || '') + (!!error ? ' is-invalid' : '') })) || children}
        {error && <FormFeedback className="d-block">{error}</FormFeedback>}
    </>;
}

type ValidatorProps = {
  name: string;
  type: any;
  children: JSX.Element;
};

export function Validator({ name, type, children }: ValidatorProps) {
    return ValidatorCore(name, children.props.value || children.props.checked, type, children);
}

type ValueValidatorProps = {
  name: string;
  type: any;
  value: any;
  children: any;
};

export function ValueValidator({ name, value, type, children }: ValueValidatorProps) {
    return ValidatorCore(name, value, type, children);
}

export function ValidationErrors() {
  const validator = useValidator();

  if (validator.messagesShown) {
    let errors = Object.values(validator.getErrorMessages()).filter(a => !!a);
    if (!!errors.length) {
        return <Alert color="danger" toggle={() => validator.hideMessages()}>
            <p><i className="fas fa-exclamation-circle" /> <b><FormattedMessage id="VALIDATION.ERROR" /></b></p>
            <ol className="mb-0">
            { errors.map(value => <li>{ value as any }</li>) }
            </ol>
        </Alert>;
    }
  }

  return null;
}

