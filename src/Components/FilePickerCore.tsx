
import React, { useCallback } from 'react';
import prettysize from 'prettysize';
import {Button} from "reactstrap";
import { useApp, useFilePicker, usePreviewComponent } from "react-admin-base";
import {FormattedMessage} from "react-intl";

var photo_ext = ["png", "jpg", "jpeg", "svg"];

function is_photo(name) {
  return photo_ext.indexOf(name.split('.')[1]) !== -1;
}

function is_absolute(url) {
    if (url.indexOf("blob:") === 0)
        return false;

    var pat = /^https?:\/\//i;
    return !pat.test(url);
}

export function Relative({ children }) {
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
    var name = value.$name;
    var src = value.$blob_url || value.$src;

    if (is_photo(name)) {
        return <div className="mt-2">
            <Relative>
                <img src={src} style={{ maxHeight: '150px', maxWidth: '100%' }} alt={name} />
            </Relative>
        </div>;
    }
    
    return null;
}

export default function FilePickerCore({ disabled, className, accepts, value, onNotify, children, transform } : { disabled?: any, className?: any, accepts?: any, value?:any, onNotify?:any, children?:any, transform?:any }) {
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
        return <div className={className}>
            { !disabled && <Button color="danger" outline size="sm" onClick={cancel}><i className="fa fa-trash" /></Button> }
            &nbsp;<Relative><a href={uc.$src} target="_blank" className="btn btn-sm btn-outline-primary"><i className="fa fa-download" /> { uc.name }</a></Relative>
            <span>&nbsp;({ prettysize(uc.$size) })</span>
            { <CustomPreview value={uc} /> }
            { children && children(uc) }
        </div>;
    }

    return null;
}
