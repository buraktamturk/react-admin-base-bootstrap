import React, { useCallback, useState } from 'react';
import { ValidatorProvider } from "react-admin-base";
import { FormattedMessage } from "react-intl";
import { Alert, Form } from 'reactstrap';
import LoadingButton from "../Components/LoadingButton";
import { ValidationErrors } from './Validator';
import { Navigate } from 'react-router-dom';

type EntityEditorParams = {
    entity: any;
    onSave?: any;
    saveButtonClassName?: string;
    saveButtonText?: string;
    disabled?: Boolean;
    children: React.ReactNode;
};

export default function EntityEditor({ entity, disabled, children, onSave, saveButtonClassName, saveButtonText }: EntityEditorParams) {
  const [ data, _2, save, loading ] = entity;

  const [ saved, setSaved ] = useState(false);
  const [ error, setError ] = useState<any>(false);

  const onSubmit = useCallback(async function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (saved) {
      setSaved(false);
    }

    if (error) {
      setError(null);
    }

    try {
      await save();
      onSave && onSave();
      setSaved(true);
    } catch(e) {
      console.error(e);
      setError((e.response && e.response.data && e.response.data.message) || (error.data && error.data.message) || e.data || e.message || e);
    }
    finally
    {

    }
  }, [save, saved, error]);

  const savedAlert = saved && <Alert color="success" toggle={() => setSaved(false)}><i className="fas fa-check-circle me-2" /><FormattedMessage id="ENTITY.SAVED" /></Alert>;

  return <ValidatorProvider>
    <Form onSubmit={onSubmit} disabled={!!loading || !!disabled}>
      { loading && <Alert color="warning" toggle={() => setSaved(false)}>
        <i className="fa fa-spin fa-spinner" />{' '}
        <FormattedMessage id="PLEASE_WAIT"/>
      </Alert>}
      { savedAlert }
      { error && <Alert color="danger" toggle={() => setError(null)}>{ error }</Alert>}
      <fieldset disabled={!!loading || !!disabled}>
        { children }
      </fieldset>
      <ValidationErrors />
      { savedAlert }
      <LoadingButton className={saveButtonClassName || "col-md-12 mt-3"} loading={loading} type="submit" color="primary">{ saveButtonText || <FormattedMessage id="ENTITY.SAVE" /> } <i className="fas fa-save fa-lg"></i></LoadingButton>
    </Form>
  </ValidatorProvider>;
}
