import React from 'react';
import {Modal, ModalProps} from "reactstrap";
import { useBootstrapOptions } from "./BootstrapOptions";

export default function BootstrapModal(props: ModalProps) {
    const bsOptions = useBootstrapOptions();

    return <Modal {...props} toggle={bsOptions.noCloseModal ? undefined : props.toggle} />;
}
