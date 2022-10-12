import React from "react";
import { FormGroup, Input, Label } from "reactstrap";

type CheckBoxProps = {
    id: string;
    type?: "checkbox"|"radio";
    label?: React.ReactNode;
    children: React.ReactNode;
};

export default function CheckBox(props: CheckBoxProps) {
	return <FormGroup check>
		<Input type={props.type || "checkbox"} {...props} children={undefined} label={undefined} />
		<Label check for={props.id}>{props.children || props.label}</Label>
	</FormGroup>;
}
