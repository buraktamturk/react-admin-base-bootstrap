import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DataContextProvider, RefreshScope, useAuth, useDataTable } from 'react-admin-base';
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from 'react-router-dom';
import { Alert, Button, Card, CardFooter, CardHeader, Col, Input, Row, Table } from 'reactstrap';
import Swal from 'sweetalert2';
import BootstrapPagination from "./BootstrapPagination";

const DataTableContext = React.createContext(null as any);
const RowDatasContext = React.createContext(null as any);
const RowDataContext = React.createContext(null as any);

export function useDataTableContext() {
    return useContext(DataTableContext);
}

type ActionsProp = {
    edit?: string;
    del?: string;
    rowSpan?: number|undefined;
    children?: React.ReactNode;
};

export function Actions({edit, del, rowSpan, children}: ActionsProp) {
    const [api] = useAuth();
    const [, setParams] = useContext(DataTableContext);
    const intl = useIntl();
    const [ loading, setLoading ] = useState(false);

    const delFnc = useCallback(async function (e) {
        e && e.preventDefault();

        const val = await Swal.fire({
            title: intl.formatMessage({ id: 'ACTIONS.DELETE.TITLE' }),
            text: intl.formatMessage({ id: 'ACTIONS.DELETE.TEXT' }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: intl.formatMessage({ id: 'ACTIONS.DELETE.CONFIRM' })
        });
        
        if (val.value) {
            setLoading(true);
            try {
                await api.tokenized.delete(del);
                setParams({}, true);
            } finally {
                setLoading(false);
            }
        }
    }, [api, del, setParams, intl, setLoading]);

    return <td className="min" rowSpan={rowSpan}>
        {edit && <Link to={edit}><Button outline color="primary"><i className="fa fa-pencil-alt"/></Button></Link>}
        {edit && del && ' '}
        {del && <Button color="danger" outline onClick={delFnc} disabled={loading}><i className={loading ? "fa fa-spin fa-spinner" : "fa fa-trash"} /></Button>}
        {children}
    </td>;
}

export function IdColumn() {
    return <Column className="min text-center" sort="id"><i className="fas fa-hashtag"/></Column>;
}

export function ActionsColumn() {
    return <Column className="min text-center"><i className="fas fa-water"/></Column>;
}

export function Column(props) {
    const [params, setParams] = useContext(DataTableContext);
    const {sort} = props;
    return <th
        {...props}
        style={props.sort && {cursor: 'pointer'}}
        onClick={props.sort && (() => setParams(params => ({
            ...params,
	    sort: sort,
            desc: params.sort === sort ? !params.desc : true
        })))}
    >{props.children} {sort && params.sort && params.sort === sort ? params.desc ?
        <i className="fa fa-sort-down"/> :
        <i className="fa fa-sort-up"/> : ''}
    </th>;
}

export interface BootstrapTableProps {
    url: string;
    bordered?: boolean;
    noStrip?: boolean;
    defaultParams?: any;
    body?: any;
    add?: string;
    children: any;
    innerRef?: any;
}

interface RowRendererProps<Row> {
    render: (row: Row) => React.ReactNode;
}

export function RowRenderer<Row>({render}: RowRendererProps<Row>) {
    const rows = useContext(RowDatasContext);

    return <tbody>
        { rows.map(render) }
    </tbody>;
}

export default function BootstrapTable({url, bordered, noStrip, defaultParams, add, children, innerRef, body}: BootstrapTableProps) {
    const state = useState({sort: 'id', ...defaultParams});
    const [params, setParams] = state;
    const [page, lastPage, setPage, data, itemPerPage, setItemPerPage, update] = useDataTable(url, params, body);
    const intl = useIntl();
    const [ api ] = useAuth();

    console.log(children[1]);

    const ref = useRef(defaultParams);
    useEffect(function () {
        if (ref.current !== defaultParams) {
            ref.current = defaultParams;
            setParams(params => ({ ...params, ...defaultParams }));
        }
    }, [defaultParams, ref, setParams]);

    useEffect(function () {
        if (innerRef) {
            innerRef.current = setParams;

            return function () {
                innerRef.current = null;
            };
        }
    }, [setParams, innerRef]);
    
    const fetchData = useCallback(async function(extraParams) {
        if (body) {
            const data = await api.tokenized.post(url, body, { params: { ...params,  ...(extraParams || {}) } });
            return data.data;
        }

        const data = await api.tokenized.get(url, { params: { ...params,  ...(extraParams || {}) } });
        return data.data;
    }, [api, url, params, body]);

    return <Card>
        <DataTableContext.Provider value={state}>
            <DataContextProvider value={fetchData}>
                <RefreshScope update={update}>
                    <RowDatasContext.Provider value={data}>
                        <CardHeader>
                            <Row>
                                {add && <Col xs="12" md="2"><Link to={add} className="btn btn-primary font-xl d-block"><i className="fa fa-plus"/></Link></Col>}
                                <Col md="2">
                                    <Input type="select" value={itemPerPage.toString()} onChange={a => setItemPerPage(+a.currentTarget.value)}>
                                        <option value="1">1</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="150">150</option>
                                        <option value="200">200</option>
                                        <option value="-1">{intl.formatMessage({id: "ALL"})}</option>
                                    </Input>
                                </Col>
                                {children[2]}
                                <Col md="3" className="ms-auto">
                                    <Input
                                        placeholder={intl.formatMessage({id: "SEARCH"})} type="text"
                                        value={params.query || ''}
                                        onChange={e => setParams({...params, query: e.currentTarget.value})}
                                    />
                                </Col>
                            </Row>
                        </CardHeader>
                            {data === null ? <Alert className="text-center mb-0 mx-3 " color="warning"><i className="fas fa-spinner fa-spin"></i></Alert> : !data.length ? <Alert className="text-center mx-3" color="danger">
                                <i className="far fa-times-circle"></i> <FormattedMessage id="NO_DATA_IS_AVAILABLE"/>
                            </Alert> : <Table hover bordered={bordered} striped={!noStrip} responsive size="md" className="mb-0 dataTable">
                                {children[0]}
                                {children[1].type === "tbody" ? <tbody>
                                    {data && data.map(children[1].props.children)}
                                </tbody> : children[1]}
                            </Table>}
                        { lastPage > 1 && <CardFooter>
                            <nav>
                                <BootstrapPagination
                                    currentPage={page}
                                    pageCount={lastPage}
                                    onPageChange={index => setPage(index)}
                                />
                            </nav>
                        </CardFooter> }
                    </RowDatasContext.Provider>
                </RefreshScope>
            </DataContextProvider>
        </DataTableContext.Provider>
    </Card>;
}
