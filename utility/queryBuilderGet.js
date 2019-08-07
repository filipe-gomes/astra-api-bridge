"use strict";
const moment = require('moment');
const QueryTypeEnum = require('./queryTypeEnum');
const EntityEnum = require('./entityEnum');

// todo: add queryBuilderPost and basic calls


function translateField(entity, fieldname) {
    let entityfield = fieldname;    
    if (entity ===  'activityList'){
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
        this._entity = EntityEnum.UNDEFINED;
        this._queryType = QueryTypeEnum.UNDEFINED;  
        this._sort = '';
        this._limit = 200;
        this._page = 1;
        this._startIndex = 0;
        this._allowUnlimitedResults = false;
        this._fields = [];
        this._filterFields = [];
        this._filterValues = [];
        this._startDate = '';
        this._endDate = '';
        this._filterVariable = '==';  //or '!='
        this._advancedFilter = '';  //free text filter with no translation
    }

    get entity() {
        return this._entity;
    }

    set entity(enumVal) {
        this._entity = enumVal;
    }

    get queryType() {
        return this._queryType;
    }

    set queryType(enumVal) {
        this._queryType = enumVal;
    }

    get filterVariable() {
        return this._filterVariable;
    }

    set filterVariable(string) {
        this._filterVariable = string;
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
                this._filterFields.push(translateField(this._entity,filterfields[i]));
            }
        }
    }

    addFilterFields(fields) {
        if (fields) {
            this._filterFields = this._filterFields.concat(fields);
        }
    }

    addFilterValue(field) {
        if (field) {
            let valuefields = {};
            valuefields = field.split(",");
            for (let i = 0; i < valuefields.length; i++) {
                this._filterValues.push(translateField(this._entity,valuefields[i]));
            }
        }
    }

    addFilterValues(fields) {
        if (fields) {
            this._filterValues = this._filterValues.concat(fields);
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

    buildDateRange() {
        let range = '';
        if (this._startDate >= "1900-01-01") {
            if (this._filterFields.length == 0) {
                range += '&filter=';
            } else {
                range += '%26%26';
            }
            range += '((StartDateTime>%3D"' + this._startDate + '")';
            
            if (this._endDate >= this._startDate) {
                range += '%26%26(EndDateTime<%3D"' + this._endDate + '"))';
            } else {
                range += ')';
            }
        }
        return range;
    }   

    buildConflictsFilter() {
        let range = '';
        if (this._startDate >= "1900-01-01") {
            if (this._filterFields.length == 0) {
                range += '&filter=';
            } else {
                range += '%26%26';
            }
            range += '(((StartDateTime<%3D"' + this._endDate + '")';
            range += '%26%26(EndDateTime>%3D"' + this._startDate + '"))';
            range += '%7C%7C((StartDateTime>%3D"' + this._startDate + '")';
            range += '%26%26(StartDateTime<%3D"' + this._endDate + '")))';
        }
        return range;        
    }

    buildFilter() {
        let filter = '&filter=(';
        if (this._filterFields.length < this._filterValues.length) {
            var filt = this._filterFields[0].trim();
            if (this._filterVariable == '==') {
                filter += filt + ' in (';
                for (let i = 0; i < this._filterValues.length; i++) {
                    var valu = this._filterValues[i].trim();
                    if (this._filterValues.length - 1 == i) {
                        filter += '"' + valu + '"))';
                    } else {
                        filter += '"' + valu + '",';
                    }
                }
            } else {
                for (let i = 0; i < this._filterValues.length; i++) {
                    var valu = this._filterValues[i].trim();
                    if (this._filterValues.length - 1 == i) {
                        filter += '(' + filt + '!="' + valu + '"))';
                    } else {
                        filter += '(' + filt + '!="' + valu + '")%26%26';
                    }
                }
            }
        } else for (let i = 0; i < this._filterFields.length; i++) {
            var filt = this._filterFields[i].trim();
            if (this._filterValues[i]) {
                var valu = this._filterValues[i].trim();
            }
            if (this._filterFields.length - 1 == i) {
                filter += '(' + filt + this._filterVariable + '"' + valu + '"))';
            } else {
                filter += '(' + filt + this._filterVariable + '"' + valu + '")%26%26';
            }
        }
        return filter;
    }

    
    toQueryString() {
        let query = '';
        
        // add fields
        query += '&fields=' + this._fields.join('%2C');
        
        if (this._queryType === QueryTypeEnum.ADVANCED) {
            // bypase filter and values lists
            if (this._advancedFilter) {
                query += '&filter=' + this._advancedFilter;
            }
        } else {
            //create filters based on field and value lists
            if (this._filterFields.length > 0) {
                query += this.buildFilter();
            }

            //add date range or conflict filters
            if (this._queryType === QueryTypeEnum.DATE_RANGE) {
                query += this.buildDateRange();

            } else if (this._queryType == QueryTypeEnum.CONFLICTS) {
                query += this.buildConflictsFilter();
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