
import React, { useCallback } from 'react';
import prettysize from 'prettysize';
import {Button} from "reactstrap";
import { useApp, useFilePicker, usePreviewComponent, DragAndDropItem } from "react-admin-base";
import {FormattedMessage} from "react-intl";
import DragAndDropArrow from './DragAndDropArrow';

const photo_ext = ["png", "jpg", "jpeg", "svg"];

function is_photo(name) {
    const sp = (name || '').split('.');
    return photo_ext.indexOf((sp[sp.length - 1] || '').toLowerCase()) !== -1;
}

function is_absolute(url) {
    if (url.indexOf("blob:") === 0)
        return false;

    const pat = /^https?:\/\//i;
    return !pat.test(url);
}

type RelativeProps = {
    children: JSX.Element;
};

export function Relative({ children }: RelativeProps) {
    const app = useApp();

    if (!children)
        return null;

    const { src, href } = children.props;

    return React.cloneElement(children, {
        src: src && (is_absolute(src) ? app.endpoint.replace(/\/$/, "") + src : src),
        href: href && (is_absolute(href) ? app.endpoint.replace(/\/$/, "") + href : href)
    });
}

export function Preview({ value }) {
    const name = value.$name || value.name;
    const src = value.$blob_url || value.$src;

    if (is_photo(name)) {
        return <div className="mt-2">
            <Relative>
                <img src={src} style={{ maxHeight: '150px', maxWidth: '100%' }} alt={name} />
            </Relative>
        </div>;
    }

    return null;
}

export default function FilePickerCore({ disabled, index, move, className, accepts, value, onNotify, children, transform } : { disabled?: any, index?: number, move?: any, className?: any, accepts?: any, value?:any, onNotify?:any, children?:any, transform?:any }) {
    const [ uc, cancel, pick ] = useFilePicker(value, onNotify);
    const CustomPreview = usePreviewComponent() || Preview;

    const chooseFile = useCallback(function(e) {
        e.preventDefault();
        pick(accepts, transform);
    }, [pick, accepts, transform]);

    if(uc.$state === 1) { // dosya sec
        return <div className={className}>
            <Button color="primary" size="sm" onClick={chooseFile} disabled={disabled}><i className="fa fa-upload" /> <FormattedMessage id="CHOOSE_FILE" /></Button>
            { children && children(null) }
        </div>;
    } else if(uc.$state === 2) { // yukleniyor
        return <div className={className}>
            <Button color="danger" outline size="sm" onClick={cancel}><i className="fa fa-times-circle" /></Button>
            {' '}
            <Button disabled size="sm" outline color="dark">
                <i className="fa fa-spinner fa-spin" />
                <span style={{ width: '35px', display: 'inline-block' }}>{ Math.round(uc.$pr * 1000) / 10 }%</span>
                { uc.name }
            </Button>
            { children && children(uc) }
        </div>;
    } else if(uc.$state === 3) { // yuklendi
        return <DragAndDropItem item={index}>
            <div className={className}>
                <DragAndDropArrow className="me-1" />
                { !disabled && <Button type="button" color="danger" outline size="sm" className="me-1" onClick={cancel}><i className="fa fa-trash" /></Button > }
                { !disabled && <Button type="button" color="danger" outline size="sm" onClick={chooseFile}><i className="fa fa-rotate" /></Button> }
                &nbsp;<Relative><a href={uc.$src} target="_blank" className="btn btn-sm btn-outline-primary"><i className="fa fa-download" /> { uc.name }</a></Relative>
                <span>&nbsp;({ prettysize(uc.$size) })</span>
                { <CustomPreview value={uc} /> }
                { children && children(uc) }
            </div>
        </DragAndDropItem>;
    }

    return null;
}
