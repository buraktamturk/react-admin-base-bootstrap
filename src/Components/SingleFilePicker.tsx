
import React, { useCallback, useMemo } from 'react';
import { useUploadController } from "react-admin-base";
import FilePickerCore from "./FilePickerCore";

type SingleFilePickerProps = {
    disabled?: boolean;
    className?: string;
    accepts?: string;
    value: any;
    onChange: (value: any) => void;
    children?: (value: any) => React.ReactNode;
    transform?: any;
}

export default function SingleFilePicker({ disabled, className, accepts, value, onChange, transform, children }: SingleFilePickerProps) {
    const uploadController = useUploadController();
    const controller = useMemo(() => uploadController(value), [uploadController, value]);

    const _onChange = useCallback(function() {
        if (controller.$state === 3) {
            if (value !== controller) {
                onChange(controller);
            }
        } else {
            if (!!value) {
                onChange(null);
            }
        }
    }, [ value, controller, onChange ]);
 
    return <FilePickerCore
        disabled={!!disabled}
        className={className}
        accepts={accepts}
        value={controller}
        onNotify={_onChange}
        transform={transform}
    >{children}</FilePickerCore>;
}
