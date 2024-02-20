/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {RefreshScope, useFetch, useRefresh} from 'react-admin-base';
import { FormattedMessage, useIntl } from 'react-intl';
import Select, { components } from "react-select";
import CreatableSelect from 'react-select/creatable';

import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function MultiValue(props) {
    return <components.MultiValue {...props}>
        { (props.selectProps.children && props.selectProps.children(props.data)) || props.children }
    </components.MultiValue>
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

const Components = { Option, SingleValue, MultiValue, IndicatorsContainer, MultiValueRemove };

const SortableMultiValue = (props) => {
  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const innerProps = { ...props.innerProps, onMouseDown };
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.selectProps.getOptionValue(props.data),
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div style={style} ref={setNodeRef} {...attributes} {...listeners}>
      <MultiValue {...props} innerProps={innerProps} />
    </div>
  );
};

const SortableMultiValueRemove = (props) => {
  return (
    <MultiValueRemove
      {...props}
      innerProps={{
        onPointerDown: (e) => e.stopPropagation(),
        ...props.innerProps,
      }}
    />
  );
};

const SortableComponents = { Option, SingleValue, MultiValue: SortableMultiValue, IndicatorsContainer, MultiValueRemove: SortableMultiValueRemove };

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
    sortable?: boolean;
    onAddOrEdit?: (item: any) => void;
    getNewOptionData?: (name: string, elem: React.ReactNode) => any|null;
}


export default function ApiSelect<Option = any>(props: ApiSelectProps<Option>) {
    const { disabled, url, getOptionLabel, sortable, getOptionValue, idKey, nameKey, filter, group, onCreateOption, getNewOptionData, isMulti, onChange, value, placeholder, staticOptions } = props;
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

    const _getOptionValue = getOptionValue || ((row:any) => row[idKey || 'id']);

    const onDragEnd = useCallback(({ active, over }) => {
      if (!active || !over) return;

      const oldIndex = (value as any).findIndex((item) => _getOptionValue(item) === active.id);
      const newIndex = (value as any).findIndex((item) => _getOptionValue(item) === over.id);
      const newValue = arrayMove(value as any, oldIndex, newIndex);
      onChange(newValue as any);
    }, [ _getOptionValue, value, onChange ]);

    const Component = (onCreateOption ? CreatableSelect : Select);

    const useSort = isMulti && sortable;
    const elem = <Component
        {...props}
        className='react-select-container'
        classNamePrefix="react-select"
        onCreateOption={(onCreateOption && handleCreateOption) as any}
        getNewOptionData={(onCreateOption && (getNewOptionData || ((inputValue) =>( { [nameKey || 'name']: inputValue, __isNew__: true })))) || undefined}
        inputValue={search}
        onInputChange={a => setSearch(a)}
        components={(useSort ? SortableComponents : Components) as any}
        isLoading={!!loading || creating}
        getOptionLabel={getOptionLabel || ((row:any) => row[nameKey || 'name'])}
        getOptionValue={_getOptionValue}
        isDisabled={!!disabled || creating}
        isClearable
        isSearchable
        placeholder={placeholder || intl.formatMessage({ id: 'SELECT' })}
        options={!options ? [] : ((filter && options.filter(filter)) || options)}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
    />;

    return <RefreshScope update={update}>
        { useSort ? <DndContext modifiers={[restrictToParentElement]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
              <SortableContext
                items={((value || []) as any).map(_getOptionValue)}
                strategy={horizontalListSortingStrategy}
              >
              {elem}
             </SortableContext>
          </DndContext> : elem }
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
