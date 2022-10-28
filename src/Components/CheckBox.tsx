import React, {useId} from "react";
import { FormGroup, Input, InputProps, Label } from "reactstrap";

interface CheckBoxProps extends InputProps {
    id?: string;
    type?: "checkbox"|"radio";
    label?: React.ReactNode;
    children?: React.ReactNode;
}

export default function CheckBox(props: CheckBoxProps) {
    const id = useId();

	return <FormGroup check>
		<Input id={props.id || id} type={props.type || "checkbox"} {...props} children={undefined} label={undefined} />
		<Label check for={props.id || id}>{props.children || props.label}</Label>
	</FormGroup>;
}
