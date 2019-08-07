"use strict";
var { Enum } = require('enumify');

class EntityEnum extends Enum {}
EntityEnum.initEnum([
    'UNDEFINED', 
    'ACTIVITY_LIST',
    'BUILDING',
    'CAMPUS',
    'EVENT_TYPE',
    'EVENT_MEETING_TYPE',
    'MEETING_TYPE',
    'PERMISSION',
    'ROLE',
    'ROOM',
]);

module.exports = EntityEnum;