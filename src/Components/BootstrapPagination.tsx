
import React from "react";
import { PaginatorCore } from 'react-admin-base';
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

type BootstrapPaginationProps = {
    className?: string;
    currentPage: number;
    pageCount: number;
    onPageChange: (page: number) => void;  
};

export default function BootstrapPagination({ className, currentPage, pageCount, onPageChange }: BootstrapPaginationProps) {
    if (pageCount <= 1)
        return null;

    return <Pagination listClassName="mb-0" className={className}>
        <PaginatorCore
            activePage={currentPage}
            pageCount={pageCount}
            showPages={15}
            prevPage={index => <PaginationItem onClick={() => onPageChange(index)}><PaginationLink previous tag="button" type="button">&laquo;</PaginationLink></PaginationItem>}

            page={index => <PaginationItem key={index} active={currentPage === index}>
                <PaginationLink tag="button" type="button" onClick={() => onPageChange(index)}>{index}</PaginationLink>
            </PaginationItem>}

            nextPage={index => <PaginationItem
                onClick={() => onPageChange(index)}><PaginationLink next tag="button" type="button">&raquo;</PaginationLink></PaginationItem>}

            dots={index => <PaginationItem
                onClick={() => onPageChange(index)} active={currentPage === index}><PaginationLink tag="button" type="button">{index}</PaginationLink></PaginationItem>}
        />
    </Pagination>;
}
