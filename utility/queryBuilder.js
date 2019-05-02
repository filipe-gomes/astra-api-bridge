"use strict";

module.exports = class QueryBuilder {
    
    constructor() {
        this._fields = [];
        this._allowUnlimitedResults = false;
        this._startDate = '';
        this._endDate = '';
        this._sortOrder = '';
        this._page = 1;
        this._startIndex = 0;
        this._limit = 200;
        this._sort = '';
        this._filterfield = '';
        this._filtervalue = '';
    }

    get filterfield() {
        return this._filterfield;
    }

    set filterfield(string) {
        if (string == "EventType"){
            this._filterfield = 'EventMeetingByActivityId.Event.EventType.Name';
        }
        else if (string == "EventMeetingType"){
            this._filterfield = 'EventMeetingByActivityId.EventMeetingType.Name';
        }
        else if (string == "SectionMeetingType"){
            this._filterfield = 'SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name';
        }        
        else {
        this._filterfield = string; 
        }
    }

    get filtervalue() {
        return this._filtervalue;
    }
    
    set filtervalue(string) {
        this._filtervalue = string;
    }

    get sortorder() {
        return this._sortOrder;
    }

    set sortorder(string) {
        this._sortOrder = string; 
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
        if (this._filterfield == "StartDate"){
            query += '&filter=((StartDate>%3D"' + this._startDate + 'T00%3A00%3A00")';
            query += '%26%26(EndDate<%3D"' + this._endDate + 'T00%3A00%3A00"))';
        } else {
            query += '&filter='+this._filterfield+'%20in%20("'+this._filtervalue+'")';
        }
        query += '&sortOrder='+this._sortOrder;
        query += '&page=' + this._page;
        query += '&start=' + this._startIndex;
        query += '&limit=' + this. _limit;
        query = query.replace(/\./g, '%2E');
        query = query.replace(/\:/g, '%3A');
//        console.log(query);
        return query;
        
    }

}