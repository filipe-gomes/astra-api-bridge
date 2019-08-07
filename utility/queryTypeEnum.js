"use strict";
var { Enum } = require('enumify');

class QueryTypeEnum extends Enum {}
QueryTypeEnum.initEnum([
    'UNDEFINED', 
    'ADVANCED',  // open filter, no translation done
    'DATE_RANGE', // filters for anything starting and ending within the date range 
    'CONFLICTS', // filters for anything that crosses the date/time range
    'LIST', 
]);

module.exports = QueryTypeEnum;