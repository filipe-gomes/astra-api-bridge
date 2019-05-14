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
        this._conflicts = [];
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

    addconflict(field) {
        if (field) {
            let conflictfields = {};
            conflictfields = field.split(",");
             for (let i = 0; i < conflictfields.length; i++) {
             this._conflicts.push(conflictfields[i]);
            }
        }
    }

    addConflicts(fields) {  
        if (fields) {
            this._conflicts = this._conflicts.concat(fields);
        }
    }

  
    toQueryString() {
        let query = '';
        query += '&allowUnlimitedResults='+ this._allowUnlimitedResults
        query += '&fields=' + this._fields.join('%2C');
        if (this._filterfield == "StartDate"){
            query += '&filter=((StartDate>%3D"' + this._startDate + 'T00%3A00%3A00")';
            query += '%26%26(EndDate<%3D"' + this._endDate + 'T00%3A00%3A00"))';
        }
        else if (this._filterfield.match(/StartTime.*/)){
            query += '&filter=(((StartDateTime<%3D"' + this._endDate +'")';
            query += '%26%26(EndDateTime>%3D"' + this._startDate +'"))';
            query += '%7C%7C((StartDateTime>%3D"' + this._startDate + '")';
            query += '%26%26(StartDateTime<%3D"' + this._endDate +'")))';
            if (this._filterfield.match(/.*Room/)){
                query += '%26%26(Location.RoomId!="'+this._filtervalue+'")';
            }
        } 
        else if (this._filterfield == "RoomConflicts"){
            if (this._conflicts.length > 0) {
                query += '&filter=(';
                for (let i = 0; i < this._conflicts.length; i++) {
                    if (this._conflicts.length-1 == i){
                        query += '(Id!="'+this._conflicts[i]+'"))';
                    }
                    else {
                        query += '(Id!="'+this._conflicts[i]+'")%26%26';
                    }
                }
            }
            else {}
        } 
        else {
            query += '&filter='+this._filterfield+'%20in%20("'+this._filtervalue+'")';
            if(this._startDate != ''){
                query += '%26%26((StartDate>%3D"' + this._startDate + 'T00%3A00%3A00")';
                query += '%26%26(EndDate<%3D"' + this._endDate + 'T00%3A00%3A00"))';
            }
        }
        query += '&sortOrder='+this._sortOrder;
        query += '&page=' + this._page;
        query += '&start=' + this._startIndex;
        query += '&limit=' + this._limit;
        query = query.replace(/\./g, '%2E');
        query = query.replace(/\:/g, '%3A');
//        console.log(query);
        return query;
        
    }

}