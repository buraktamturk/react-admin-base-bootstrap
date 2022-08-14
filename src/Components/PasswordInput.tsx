import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import PasswordStrengthBar from "react-password-strength-bar";
import { FormGroup, Label, Input } from 'reactstrap';
import { Validator } from "./Validator";

interface BootstrapPasswordInput {
	value?: string;
	onChange: (str: string) => any;
	className?: string;
	disabled?: boolean;
	icon?: string;
	required?: boolean;
	placeholder?: string;
}

function BootstrapPasswordInput({ className, value, onChange, disabled, placeholder }: BootstrapPasswordInput) {
	const intl = useIntl();
	
	const short = intl.formatMessage({ id: "PASSWORD_SHORT" });
	const bad = intl.formatMessage({ id: "PASSWORD_BAD" });
	const okay = intl.formatMessage({ id: "PASSWORD_OKAY" });
	const good = intl.formatMessage({ id: "PASSWORD_GOOD" });
	const perfect = intl.formatMessage({ id: "PASSWORD_PERFECT" });
	
	const scoreWords = useMemo(() => [short, bad, okay, good, perfect], [short, bad, okay, good, perfect]);
	
	return <>
		<Input
			className={className}
			type="password"
			value={value || ''}
			onChange={a => onChange(a.currentTarget.value)}
			disabled={disabled}
			placeholder={placeholder}
			autoComplete="new-password"
		/>
		<PasswordStrengthBar
			className="password-str-bar"
			password={value || ''}
			scoreWords={scoreWords}
			shortScoreWord={short}
		/>
	</>
}

interface PasswordInputParams {
	value?: string;
	onChange: (str: string) => any;
	className?: string;
	disabled?: boolean;
	icon?: string;
	required?: boolean;
	placeholder?: string;
}

export default function PasswordInput({ value, onChange, className, disabled, icon, required, placeholder }: PasswordInputParams) {
	const [ password2, setPassword2 ] = useState('');
	
	const iconElem = icon && <i className={icon} />;
	
	useEffect(function() {
		if (!value) {
			setPassword2('');
		}
	}, [value, setPassword2]);
	
	return <>
		<FormGroup className={className}>
			{iconElem}
			<Label><FormattedMessage id="PASSWORD" /></Label>
			<Validator name="password" type={[required && "required", "securepassword"].filter(a => !!a)}>
				<BootstrapPasswordInput
					value={value}
					onChange={onChange}
					disabled={disabled}
					placeholder={placeholder}
				/>
			</Validator>
		</FormGroup>
		{ !!(required || value) && <FormGroup className={className}>
			{iconElem}
			<Label><FormattedMessage id="PASSWORD_AGAIN" /></Label>
			<Validator name="password2" type={[(required || value) && "required", { password: value || '' }].filter(a => !!a)}>
				<Input
					type="password"
					value={password2 || ''}
					onChange={a => setPassword2(a.currentTarget.value)}
					disabled={disabled}
					autoComplete="new-password"
				/>
			</Validator>
		</FormGroup> }
	</>;
}
