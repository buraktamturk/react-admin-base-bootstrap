import React from "react";
import { FormattedMessage } from "react-intl";

export interface TitleOrTranslateProps {
    title?: string;
    translate?: string;
    values?: Record<string, any>;
}

export default function TitleOrTranslate({ title, translate, values }: TitleOrTranslateProps){
    return title ? <>{title}</> : <FormattedMessage id={translate} values={values} />;
}
