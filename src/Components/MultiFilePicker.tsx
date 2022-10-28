
import React, { useMemo } from 'react';
import { useMultiFilePicker, DragAndDropProvider } from "react-admin-base";
import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";
import FilePickerCore from "./FilePickerCore";

type MultiFilePickerProps = {
    disabled?: boolean;
    className?: string;
    accepts?: string;
    value: any;
    onChange: (value: any) => void;
    noMove?: boolean;
    children?: (value: any) => React.ReactNode;
}

export default function MultiFilePicker({ disabled, className, noMove, accepts, value, onChange, children }: MultiFilePickerProps) {
    const uniqueIdList = useMemo(() => [] as any, []);
    const [ controllers, _onChange, chooseFile, onMove ] = useMultiFilePicker(value, onChange);

    function getConstantUniqueIdFor(element) {
        if (uniqueIdList.indexOf(element) < 0) {
            uniqueIdList.push(element);
        }
        return uniqueIdList.indexOf(element);
    }

    return <div>
        <Button color="primary" size="sm" disabled={!!disabled} outline onClick={chooseFile.bind(null, accepts)}>
            <i className="fa fa-upload" /> <FormattedMessage id="CHOOSE_FILE" />
        </Button>
        { children && children(null) }

        <DragAndDropProvider onMove={!noMove && onMove}>
            { controllers.map((a,i) => <FilePickerCore
                key={getConstantUniqueIdFor(a)}
                disabled={!!disabled}
                className="mt-2"
                accepts={accepts}
                value={a}
                index={i}
                onNotify={_onChange.bind(null, a)}
            >{children}</FilePickerCore>) }
        </DragAndDropProvider>
    </div>;
}
