"use strict";

module.exports = class QueryBuilder {
    
    constructor() {
        this._fields = [];
        this._allowUnlimitedResults = false;
        this._startDate = ''
        this._endDate = ''
        this._sortOrder = ''
        this._page = 1;
        this._startIndex = 0;
        this._limit = 200;
        this._sort = '';
    }

    get startDate() {
        return this._startDate;
    }

    set startDate(date) {
        this._startDate = date; 
    }

    get endDate() {
        return this._endDate;
    }

    set endDate(date) {
        this._endDate = date; 
    }

    addField(field) {
        if (field) {
             this._fields.push(field);
        }
    }

    addFields(fields) {                   
        if (fields) {
            this._fields = this._fields.concat(fields);
        }
    }

    toQueryString() {
        let query = '';
        query += '&allowUnlimitedResults='+ this._allowUnlimitedResults
        query += '&fields=' + this._fields.join('%2C');
        query += '&filter=((StartDate>%3D"' + this._startDate + 'T00%3A00%3A00")';
        query += '%26%26(EndDate<%3D"' + this._endDate + 'T00%3A00%3A00"))';
        query += '&sortOrder=%2BStartDateTime';
        query += '&page=' + this._page;
        query += '&start=' + this._startIndex;
        query += '&limit=' + this. _limit;
        query = query.replace('.', '%2E');
        query = query.replace(':', '%3A');
        return query;
    }

}