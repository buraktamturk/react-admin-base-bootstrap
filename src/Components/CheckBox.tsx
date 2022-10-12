import React from "react";
import { FormGroup, Input, InputProps, Label } from "reactstrap";

interface CheckBoxProps extends InputProps {
    id: string;
    type?: "checkbox"|"radio";
    label?: React.ReactNode;
    children: React.ReactNode;
}

export default function CheckBox(props: CheckBoxProps) {
	return <FormGroup check>
		<Input type={props.type || "checkbox"} {...props} children={undefined} label={undefined} />
		<Label check for={props.id}>{props.children || props.label}</Label>
	</FormGroup>;
}
