import React from "react";
import { FormGroup, Input, Label } from "reactstrap";

export default function CheckBox(props: any) {
	return <FormGroup check>
		<Input type={props.type || "checkbox"} {...props} label={undefined} />
		<Label check for={props.id}>{props.children || props.label}</Label>
	</FormGroup>;
}
