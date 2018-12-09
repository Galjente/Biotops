"use strict";

interface RestPage<TPageType> {
    content: Array<TPageType>,
    page: number,
    totalPages: number,
    perPage: number
}