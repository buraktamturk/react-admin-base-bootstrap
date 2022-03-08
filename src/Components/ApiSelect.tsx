/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useFetch } from 'react-admin-base';
import { FormattedMessage, useIntl } from 'react-intl';
import Select, { components } from "react-select";
import CreatableSelect from 'react-select/creatable';

function Option(props) {
    return <components.Option {...props}>
        { (props.selectProps.children && props.selectProps.children(props.data)) || (props.data.__isNew__ ? <FormattedMessage
            id="CREATE_VALUE"
            values={{ text: props.children }}
        /> : props.children) }
    </components.Option>
}

function SingleValue(props) {
    return <components.SingleValue {...props}>
        { (props.selectProps.children && props.selectProps.children(props.data)) || (props.data.__isNew__ ? <FormattedMessage
            id="CREATE_VALUE"
            values={{ text: props.children }}
        /> : props.children) }
    </components.SingleValue>
}

function EditOrAddIndicator(props) {
    const { className, cx, getStyles, innerProps } = props;

    return (
      <div
        {...innerProps}
        className={cx(
          {
            indicator: true,
            'clear-indicator': true
          },
          className
        )}
        css={getStyles('clearIndicator', props)}
        onMouseDown={e => { 
            e.stopPropagation();
            e.preventDefault();
            props.selectProps.onAddOrEdit();
        }}
      >
       <i className={"fas " + (props.hasValue ? 'fa-pencil-alt' : 'fa-plus')} />
      </div>);
}

function IndicatorsContainer(props) {
    return <components.IndicatorsContainer {...props}>
        { props.selectProps.onAddOrEdit && <React.Fragment>
            <EditOrAddIndicator {...props} />
            <components.IndicatorSeparator {...props} />
        </React.Fragment> }
        {props.children}
    </components.IndicatorsContainer>;
}

const Components = { Option, SingleValue, IndicatorsContainer };

export default function ApiSelect(props) {
    const { disabled, url, getOptionLabel, getOptionValue, idKey, nameKey, filter, group, onCreateOption, getNewOptionData, isMulti, onChange, value, placeholder, staticOptions } = props;
    const intl = useIntl();
    const [ search, setSearch ] = useState('');
    const params = useMemo(() => ({ query: search }), [search]);
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const [ hasMenuOpen, setHasMenuOpen ] = useState(false);
    const [ data, loading ] = useFetch((hasMenuOpen && url) || false, params);
    const [ creating, setCreating ] = useState(false);

    let options = staticOptions || (data && data.data) || data;
    if (group) {
        options = group(options || []);
    }

    const handleCreateOption = useCallback(async function(input) {
        setCreating(true);
        try {
            let option = await onCreateOption(input);
            if (isMulti) {
                onChange((value || []).concat([option]));
            } else {
                onChange(option);
            }
        } finally {
            setCreating(false);
        }
    }, [onCreateOption, setCreating, isMulti, value]);

    const onMenuOpen = useCallback(function() {
        setIsMenuOpen(true);
        setHasMenuOpen(true);
    }, [ setIsMenuOpen, setHasMenuOpen ]);

    const onMenuClose = useCallback(function() {
        setIsMenuOpen(false);
    }, [ setIsMenuOpen ]);

    const Component = onCreateOption ? CreatableSelect : Select;

    return <Component
        {...props}
        onCreateOption={(onCreateOption && handleCreateOption) || null}
        getNewOptionData={onCreateOption ? getNewOptionData ? getNewOptionData : (inputValue) =>( { [nameKey || 'name']: inputValue, __isNew__: true }) : null}
        inputValue={search}
        onInputChange={a => setSearch(a)}
        components={Components}
        isLoading={!!loading || creating}
        getOptionLabel={getOptionLabel || ((row:any) => row[nameKey || 'name'])}
        getOptionValue={getOptionValue || ((row:any) => row[idKey || 'id'])}
        isDisabled={!!disabled || creating}
        isClearable
        isSearchable
        placeholder={placeholder || intl.formatMessage({ id: 'SELECT' })}
        options={!options ? [] : ((filter && options.filter(filter)) || options)}
        isMenuOpen={isMenuOpen}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
    />;
}
