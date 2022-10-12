
import React from 'react';
import { useApp, useAuth, useLogin } from 'react-admin-base';
import { FormattedMessage } from 'react-intl';

type ExternalLoginButtonProps = {
    id: string;
    icon?: string;
    name: string;
    url: string;
};

export default function ExternalLoginButton({ id, icon, name, url }: ExternalLoginButtonProps) {
  const { endpoint } = useApp();
  const [{ client_id }] = useAuth();
  const { login } = useLogin();

  return <a className={"btn btn-primary d-block w-100 btn-social-"+id} href={endpoint + url + '?client_id=' + client_id + '&callback_url=' + encodeURIComponent(window.location.origin + login)}>
      <i className={"fab fa-" + (icon || id) + " me-2"} /> <FormattedMessage id="SIGN_IN_USING" values={{ provider: <b>{name}</b> }} />
  </a>;
}
