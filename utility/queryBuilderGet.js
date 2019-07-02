"use strict";

module.exports = class QBGet {
    
    constructor() {
        this._resulttype = '';
        this._sortOrder = '';
        this._limit = 200;
        this._page = 1;
        this._startIndex = 0;
        this._sort = '';        
        this._allowUnlimitedResults = false;        
        this._fields = [];
        this._filterfields = [];
        this._filtervalues = [];
        this._datetimerange = '';
        this._startDate = '';
        this._endDate = '';
        this._filtervariable = '==';
        this._typelimitation = '';
        this._usagelimitation = '';
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
    get sortOrder() {
        return this._sortOrder;
    }

    set sortOrder(string) {
        this._sortOrder = string; 
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
             this._filterfields.push(filterfields[i]);
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
             this._filtervalues.push(valuefields[i]);
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
        this._startDate = date; 
    }

    get endDate() {
        return this._endDate;
    }

    set endDate(date) {
        this._endDate = date; 
    }

    get typelimitation() {
        return this._typelimitation;
    }

    set typelimitation(string) {
        if (string == "EventType"){
            this._typelimitation = 'EventMeetingByActivityId.Event.EventType.Name';
        }
        else if (string == "EventMeetingType"){
            this._typelimitation = 'EventMeetingByActivityId.EventMeetingType.Name';
        }
        else if (string == "SectionMeetingType"){
            this._typelimitation = 'SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name';
        }        
        else {
        this._typelimitation = string; 
        }
    }

    get datetimerange() {
        return this._datetimerange;
    }

    set datetimerange(string) {
        if (string == "Date"){
            this._datetimerange = 'EventMeetingByActivityId.Event.EventType.Name';
        }
        else if (string == "Time"){
            this._datetimerange = 'EventMeetingByActivityId.EventMeetingType.Name';
        }
        else {
        this._datetimerange = string; 
        }
    }

    get usagelimitation() {
        return this._usagelimitation;
    }

    set usagelimitation(string) {
        if (string == "Scheduled"){
            this._usagelimitation = 'EventMeetingByActivityId.Event.EventType.Name';
        }
        else if (string == "Requested"){
            this._usagelimitation = 'EventMeetingByActivityId.EventMeetingType.Name';
        }
        else if (string == "Cancelled"){
            this._usagelimitation = 'SectionMeetInstanceByActivityId.SectionMeeting.MeetingType.Name';
        }        
        else {
        this._usagelimitation = string; 
        }
    }    

  
    toQueryString() {
        let query = '';
        query += '&fields=' + this._fields.join('%2C');
        if (this._resulttype == "List"){
            if (this._filterfields.length > 0) {
                query += '&filter=(';
                if (this._filterfields.length < this._filtervalues.length){
                    var filt = this._filterfields[0].trim();
                    if (this._filtervariable == '==') {
                        query += filt+' in (';
                        for (let i = 0; i < this._filtervalues.length; i++) {
                            var valu = this._filtervalues[i].trim();
                            if (this._filtervalues.length-1 == i){
                                query += '"'+valu+'"))';
                            }
                            else {
                                query += '"'+valu+'",';
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < this._filtervalues.length; i++) {
                            var valu = this._filtervalues[i].trim();
                            if (this._filtervalues.length-1 == i){
                                query += '('+filt+'!="'+valu+'"))';
                            }
                            else {
                                query += '('+filt+'!="'+valu+'")%26%26';
                            }
                        }
                    }
                }
                 else for (let i = 0; i < this._filterfields.length; i++) {
                    var filt = this._filterfields[i].trim();
                    var valu = this._filtervalues[i].trim();
                    if (this._filterfields.length-1 == i){
                        query += '('+filt+this._filtervariable+'"'+valu+'"))';
                    }
                    else {
                        query += '('+filt+this._filtervariable+'"'+valu+'")%26%26';
                    }
                }
            }
            else {}
        }
        else if (this._resulttype == "RoomConflicts"){
            if (this._filtervalues.length > 0) {
                query += '&filter=(';
                for (let i = 0; i < this._filtervalues.length; i++) {
                    if (this._filtervalues.length-1 == i){
                        query += '(Id!="'+this._filtervalues[i]+'"))';
                    }
                    else {
                        query += '(Id!="'+this._filtervalues[i]+'")%26%26';
                    }
                }
            }
            else {}
        } 

         
        query += '&allowUnlimitedResults='+ this._allowUnlimitedResults;
        query += '&sortOrder='+this._sortOrder;
        query += '&page=' + this._page;
        query += '&start=' + this._startIndex;
        query += '&limit=' + this._limit;
        query = query.replace(/\./g, '%2E');
        query = query.replace(/\:/g, '%3A');
        return query;

        
    }

}