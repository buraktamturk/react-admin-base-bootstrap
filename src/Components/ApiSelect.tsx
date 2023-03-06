/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {RefreshScope, useFetch, useRefresh} from 'react-admin-base';
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
    const { className, cx, getStyles, innerProps, isMulti } = props;
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
          <i className={"fas " + (props.hasValue && !isMulti ? 'fa-pencil-alt' : 'fa-plus')} />
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

function MultiValueRemove(props) {
    return <Fragment>
        { props.selectProps.onAddOrEdit && <components.MultiValueRemove {...props} innerProps={{ ...props.innerProps, onClick: () => props.selectProps.onAddOrEdit(props.data) }}>
            <i className="fas fa-pencil" style={{ fontSize: '.75em' }} />
        </components.MultiValueRemove> }
        <components.MultiValueRemove {...props} />
    </Fragment>;
}

const Components = { Option, SingleValue, IndicatorsContainer, MultiValueRemove };

export interface ApiSelectProps<Option = any> {
    url?: string;
    value: Option|Option[];
    onChange: (a: Option|Option[]|null) => void;
    getOptionLabel?: (a: any) => string;
    getOptionValue?: (a: any) => string;
    onCreateOption?: (a: string) => Option|Promise<Option>;
    filter?: (a: Option) => boolean;
    group?: (a: Option[]) => any[];
    isMulti?: boolean;
    idKey?: string;
    nameKey?: string;
    disabled?: boolean;
    placeholder?: string;
    staticOptions?: any[];
    onAddOrEdit?: (item: any) => void;
    getNewOptionData?: (name: string, elem: React.ReactNode) => any|null;
}

export default function ApiSelect<Option = any>(props: ApiSelectProps<Option>) {
    const { disabled, url, getOptionLabel, getOptionValue, idKey, nameKey, filter, group, onCreateOption, getNewOptionData, isMulti, onChange, value, placeholder, staticOptions } = props;
    const intl = useIntl();
    const [ search, setSearch ] = useState('');
    const params = useMemo(() => ({ query: search }), [search]);
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const [ hasMenuOpen, setHasMenuOpen ] = useState(false);
    const [ data, loading, error, update ] = useFetch((isMenuOpen && url) || false, params);
    const [ creating, setCreating ] = useState(false);

    let options = staticOptions || (data && data.data) || data;
    if (group) {
        options = group(options || []);
    }

    const handleCreateOption = useCallback(async function(input) {
        if (!onCreateOption)
            return null;

        setCreating(true);
        try {
            let option = await onCreateOption(input);
            if (isMulti) {
                onChange(((value as Option[]) || []).concat([option]));
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

    return <RefreshScope update={update}>
        <Component
            {...props}
            className='react-select-container'
            classNamePrefix="react-select"
            onCreateOption={onCreateOption && handleCreateOption}
            getNewOptionData={(onCreateOption && (getNewOptionData || ((inputValue) =>( { [nameKey || 'name']: inputValue, __isNew__: true })))) || undefined}
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
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
        />
    </RefreshScope>;
}

export interface CreateSelectProps<Option = any> extends ApiSelectProps<Option> {
    Component: any;
}

export function CreateSelect(props: CreateSelectProps) {
    const { Component, onChange, value, isMulti, idKey } = props;

    const update = useRefresh();
    const [ isOpen, setIsOpen ] = useState<any>(false);
    const isOpenId = isOpen === true ? null : isOpen && isOpen[idKey || "id"];

    const onReload = useCallback(function(data) {
        setIsOpen(false);
        data && onChange(isMulti ? isOpenId ? value.map(b => b.id === isOpenId ? data : b) : (value || []).concat([data]) : data);
        update && update();
        }, [value, onChange, isMulti, isOpenId, isOpen, update, setIsOpen]);

    return <Fragment>
        { isOpen && <Component id={isOpenId || (!isMulti && value && value[idKey || "id"])} onReload={onReload} /> }
        <ApiSelect {...props} onAddOrEdit={item => setIsOpen(item || true)} />
    </Fragment>;
}
