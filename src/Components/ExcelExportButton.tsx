import React from 'react';
import {useExporter} from 'react-admin-base';
import {Button, Col} from "reactstrap";

export default function ExcelExportButton({name, header, params, map, extra}) {
    const [ handleExport, loading ] = useExporter(header, params, map, extra);

    return <Col><Button className="w-100 d-block" type="button" size="lg" color="success" outline disabled={!!loading} onClick={() => handleExport(name)}>
        {loading ? <i className="fas fa-spin fa-spinner"/> : <i className="fas fa-file-excel"/>}
    </Button></Col>
}
