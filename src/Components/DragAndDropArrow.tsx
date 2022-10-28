import React from "react";
import {Button, ButtonProps} from "reactstrap";
import { useDragContext } from "react-admin-base";

export default function DragAndDropArrow(props: ButtonProps) {
    const [ ref, isDragging ] = useDragContext();

    if (!ref)
        return null;

    return <Button type="button" innerRef={ref} outline size="sm" color="primary" {...props}>
        <i className={"fas fa-" + (isDragging ? "circle-dot" : "arrows-up-down-left-right")} />{props.children}
    </Button>;
}
