import React, { useCallback, useContext, useRef, useState } from 'react';
import { ValidatorProvider } from "react-admin-base";
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate, Routes, useParams, Route } from 'react-router-dom';
import { Alert, Button, Col, Form, Modal, ModalFooter, ModalHeader, Row } from "reactstrap";
import LoadingButton from '../Components/LoadingButton';
import BootstrapDataTable, { Actions, BootstrapTableProps } from './BootstrapDataTable';
import BootstrapModal from './BootstrapModal';
import {useBootstrapOptions} from "./BootstrapOptions";

type ModalEntityEditorParams = {
    entity: any;
    title?: string;
    size?: string;
    url?: string;
    onReload?: any;
    disabled?: Boolean;
    children: React.ReactNode;
}

export function ModalEntityEditor({ entity, title, size, url, onReload, disabled, children } : ModalEntityEditorParams) {
    const [ data, , save, loading, dirty ] = entity;
    const bsOptions = useBootstrapOptions();

    const [ open, setOpen ] = useState(true);
    const [ saved, setSaved ] = useState(false);
    const [ error, setError ] = useState<any>(false);

    const onSubmit = useCallback(async function(e) {
        e.stopPropagation();
        e.preventDefault();


        if (saved) {
            setSaved(false);
        }

        if (error) {
            setError(null);
        }

        try {
            let data = await save();
            if (onReload) {
                await onReload(data);
            }

            if (url) {
                setSaved(true);
            }
        } catch(e) {
            console.error(e);
            setError((e.response && e.response.data && e.response.data.message) || (error.data && error.data.message) || e.data || e.message || e);
        }
        finally
        {

        }
    }, [save, saved, error, onReload, url]);

    const check = bsOptions.noCloseOnSave && dirty;
    const intl = useIntl();
    const checkConfirmText = intl.formatMessage({ id: 'CANCEL_ENTITY_SAVE' });
    const onClose = useCallback(function() {
        if (check) {
            const ok = confirm(checkConfirmText);
            if (!ok)
                return ;
        }

        if (url) {
            setOpen(false);
        } else {
            onReload(null);
        }
    }, [ setOpen, onReload, url, check, checkConfirmText ]);

    return <>
        { ((!bsOptions.noCloseOnSave && saved) || !open) && url && <Navigate to={url} replace />}
        { bsOptions.noCloseOnSave && saved && open && url && <Navigate to={url + "/" + data.id + "/edit"} replace />}
        <BootstrapModal isOpen size={size} toggle={onClose} fade={false}>
            { title && <ModalHeader toggle={onClose}>
                <b>{ title }</b>
            </ModalHeader> }
            <ValidatorProvider>
                <Form onSubmit={onSubmit} disabled={!!loading || disabled}>
                    <fieldset disabled={!!loading || !!disabled}>
                        { children }
                    </fieldset>
                    <ModalFooter>
                        { error && <Alert color="danger" toggle={() => setError(null)} style={{ display: 'block', width: '100%' }}>{ error }</Alert>}
                        { bsOptions.noCloseOnSave && !dirty && saved && <Alert color="success" style={{ display: 'block', width: '100%' }}><i className="fas fa-check-circle" /> <FormattedMessage id="ENTITY.SAVED" /></Alert>}
                      <Row className="w-100">
                        <Col>
                            <LoadingButton block loading={loading} disabled={bsOptions.onlySaveOnDirty && !dirty} type="submit" color="primary">
                                <i className="fas fa-save" />{' '}<FormattedMessage id="ENTITY.SAVE" />
                            </LoadingButton>
                        </Col>
                        <Col>
                          <Button block outline color="danger" onClick={(e) => { e.preventDefault(); (url ? setOpen(false) : onReload(null)); }}>
                              <i className="fas fa-times-circle" />{' '}<FormattedMessage id="ENTITY.CANCEL" />
                          </Button>
                        </Col>
                      </Row>
                    </ModalFooter>
                </Form>
            </ValidatorProvider>
        </BootstrapModal>
    </>;
}

const UrlContext = React.createContext(null as any);

type CrudActionProps = {
  id: any;
  edit?: Boolean;
  del: string;
  children?: React.ReactNode;
};

export function CRUDActions({ id, edit, del, children }: CrudActionProps) {
    const url = useContext(UrlContext);

    return <Actions edit={edit && (url + "/" + id + "/edit")} del={del}>
        { children }
    </Actions>;
}

function ComponentWrapper({ Component, ...props }) {
  const { id } = useParams();
  return <Component {...props} id={id} />;
}

interface CRUDProps extends BootstrapTableProps {
    apiUrl?: string;
    Component: any;
    noAdd?: boolean;
}

export default function CRUD(props: CRUDProps) {
    const ref = useRef(null as any);
    const { url, apiUrl, Component, defaultParams, noAdd } = props;

    const reload = useCallback(async function() {
        if (ref.current) {
            ref.current({});
        }
    }, [ref]);

    return <UrlContext.Provider value={url}>
        <Routes>
          { !noAdd && <Route path="create" element={<ComponentWrapper Component={Component} url={url} onReload={reload} {...(defaultParams || {})} />} /> }
          <Route path=":id/edit" element={<ComponentWrapper Component={Component} url={url} onReload={reload} {...(defaultParams || {})} />} />
        </Routes>
        <BootstrapDataTable innerRef={ref} add={(!noAdd && "create") || undefined} {...props} url={apiUrl || url}>
            {props.children}
        </BootstrapDataTable>
    </UrlContext.Provider>;
}
