import React, { useMemo } from "react";
import { ValidatorOptionProvider } from "react-admin-base";
import { useIntl } from "react-intl";
import zxcvbn from 'zxcvbn';

export default function DefaultValidatorOptions({ children }) {
	const intl = useIntl();
	
	const options = useMemo(() => ({
		validators: {
			password: {
				message: intl.formatMessage({ id: 'PASSWORD_NOMATCH' }),
				rule: function (val, params) {
					return val == params[0];
				}
			},
			securepassword: {
				message: intl.formatMessage({ id: 'INSECURE_PASSWORD' }),
				rule: function (val, params) {
					return !val || (zxcvbn(val, []).score >= 2);
				}
			}
		}
	}), [intl]);
	
	return <ValidatorOptionProvider value={options}>
		{ children }
	</ValidatorOptionProvider>;
}
