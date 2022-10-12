
import React from 'react';
import { Button, ButtonProps } from 'reactstrap';

export default function LoadingButton(props: ButtonProps) {
  return props.loading ? <Button {...props} loading={undefined} disabled={true}><i className="fas fa-spin fa-circle-notch" /></Button> : <Button {...props} loading={undefined} />;
}
