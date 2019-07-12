"use strict";
const moment = require('moment');


function facfield(entityname, fieldname) {
    let entityfield = fieldname;
    if (entityname == 'activityList'){
        switch (entityfield.toUpperCase()) {
            case 'eventType'.toUpperCase():
                entityfield = 'EventMeetingByActivityId.Event.EventType.Name';
                break;
            case 'eventMeetingType'.toUpperCase():
                entityfield = 'EventMeetingByActivityId.EventMeetingType.Name';
                break;
            case 'sectionMeetingType'.toUpperCase():
                entityfield = 'SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name';
                break;
            case 'roomId'.toUpperCase():
                entityfield = 'Location.RoomId';
                break;
            default:
                break;
        }
    }
    return entityfield;
}

module.exports = class QBGet {
    constructor() {
        this._entity = '';  //used to check for field name translations
        this._resulttype = '';  
            /** 1. Advanced - open filter, no translation done
                2. DateRange - filters for anything starting and ending within the date range
                3. Conflicts - filters for anything that crosses the date/time range 
            */
        this._sort = '';
        this._limit = 200;
        this._page = 1;
        this._startIndex = 0;
        this._allowUnlimitedResults = false;
        this._fields = [];
        this._filterfields = [];
        this._filtervalues = [];
        this._startDate = '';
        this._endDate = '';
        this._filtervariable = '==';  //or '!='
        this._advancedFilter = '';  //free text filter with no translation
    }

    get entity() {
        return this._entity;
    }

    set entity(string) {
        this._entity = string;
    }

    get resulttype() {
        return this._resulttype;
    }

    set resulttype(string) {
        this._resulttype = string;
    }

    get filtervariable() {
        return this._filtervariable;
    }

    set filtervariable(string) {
        this._filtervariable = string;
    }
    get sort() {
        return this._sort;
    }

    set sort(string) {
        this._sort = string;
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

    addFilterField(field) {
        if (field) {
            let filterfields = {};
            filterfields = field.split(",");
            for (let i = 0; i < filterfields.length; i++) {
                this._filterfields.push(facfield(this._entity,filterfields[i]));
            }
        }
    }

    addFilterFields(fields) {
        if (fields) {
            this._filterfields = this._filterfields.concat(fields);
        }
    }

    addFilterValue(field) {
        if (field) {
            let valuefields = {};
            valuefields = field.split(",");
            for (let i = 0; i < valuefields.length; i++) {
                this._filtervalues.push(facfield(this._entity,valuefields[i]));
            }
        }
    }

    addFilterValues(fields) {
        if (fields) {
            this._filtervalues = this._filtervalues.concat(fields);
        }
    }

    get startDate() {
        return this._startDate;
    }

    set startDate(date) {
        this._startDate = moment(date).format('YYYY-MM-DDTHH:mm:ss');
    }

    get endDate() {
        return this._endDate;
    }

    set endDate(date) {
        this._endDate = moment(date).format('YYYY-MM-DDTHH:mm:ss');
    }

    get advancedFilter() {
        return this._advancedFilter;
    }

    set advancedFilter(string) {
        this._advancedFilter = string;
    }


    toQueryString() {
        let query = '';
        //add fields
        query += '&fields=' + this._fields.join('%2C');
        //if using advanced filter, add and return results
        if (this._resulttype == 'Advanced') {
            if (this._advancedFilter) {
                query += '&filter=' + this._advancedFilter;
            }
        } else {
            //create filters based on field and value lists
            if (this._filterfields.length > 0) {
                query += '&filter=(';
                if (this._filterfields.length < this._filtervalues.length) {
                    var filt = this._filterfields[0].trim();
                    if (this._filtervariable == '==') {
                        query += filt + ' in (';
                        for (let i = 0; i < this._filtervalues.length; i++) {
                            var valu = this._filtervalues[i].trim();
                            if (this._filtervalues.length - 1 == i) {
                                query += '"' + valu + '"))';
                            } else {
                                query += '"' + valu + '",';
                            }
                        }
                    } else {
                        for (let i = 0; i < this._filtervalues.length; i++) {
                            var valu = this._filtervalues[i].trim();
                            if (this._filtervalues.length - 1 == i) {
                                query += '(' + filt + '!="' + valu + '"))';
                            } else {
                                query += '(' + filt + '!="' + valu + '")%26%26';
                            }
                        }
                    }
                } else for (let i = 0; i < this._filterfields.length; i++) {
                    var filt = this._filterfields[i].trim();
                    if (this._filtervalues[i]) {
                        var valu = this._filtervalues[i].trim();
                    }
                    if (this._filterfields.length - 1 == i) {
                        query += '(' + filt + this._filtervariable + '"' + valu + '"))';
                    } else {
                        query += '(' + filt + this._filtervariable + '"' + valu + '")%26%26';
                    }
                }
            }
            //add date range or conflict filters
            if (this._resulttype == 'DateRange' & this._startDate >= "1900-01-01") {
                if (this._filterfields.length == 0) {
                    query += '&filter=';
                } else {
                    query += '%26%26';
                }
                query += '((StartDateTime>%3D"' + this._startDate + '")';
                if (this._endDate >= this._startDate) {
                    query += '%26%26(EndDateTime<%3D"' + this._endDate + '"))';
                } else {
                    query += ')';
                }
            } else if (this._resulttype == 'Conflicts' & this._startDate >= "1900-01-01") {
                if (this._filterfields.length == 0) {
                    query += '&filter=';
                } else {
                    query += '%26%26';
                }
                query += '(((StartDateTime<%3D"' + this._endDate + '")';
                query += '%26%26(EndDateTime>%3D"' + this._startDate + '"))';
                query += '%7C%7C((StartDateTime>%3D"' + this._startDate + '")';
                query += '%26%26(StartDateTime<%3D"' + this._endDate + '")))';
            }
            //add standard parameters
            query += '&allowUnlimitedResults=' + this._allowUnlimitedResults;
            query += '&sort=' + this._sort;
            query += '&page=' + this._page;
            query += '&start=' + this._startIndex;
            query += '&limit=' + this._limit;
        }
        //clean up ascii issues
        query = query.replace(/\./g, '%2E');
        query = query.replace(/\:/g, '%3A');
        return query;
    }

}