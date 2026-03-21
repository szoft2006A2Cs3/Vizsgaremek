import User from './UserClass.js';

export default class UserDataClass 
{
    constructor(object, callApiFunc) {
        if (!object) {
            this.user = null;
            this.userSettings = null;
            this.schedules = [];
            this.groups = [];
            this.groupuserconns = [];
            return;
        }
        this.callApi = callApiFunc;

        this.user = new User(
            object.userId,
            object.userName,
            object.email,
            object.displayName,
            object.password,
            object.role,
            object.token,
            object.description
        );
        //Structure:    "theme/hiddenNavbar/scheduleLayout(day/week/month)"
        this.userSettings = {"settings": object.usersettings.settings};


        this.schedules = object.schedulesusersconns.map(conn => 
            {
                return {
                    "scheduleId": conn.schedules.scheduleId,
                    "scheduleInfo": conn.schedules.scheduleInfo,
                    "template": {
                        "templateId": conn.schedules.templates.templateId,
                        "templateInfo": conn.schedules.templates.templateInfo
                    }
                }

            });

        this.groups = []
        this.pendingGroups = []
        object.groupuserconns.map(conn => 
            { 
                //console.log(conn);
                if(conn.permission != "pending")
                {
                    var group = 
                    {
                        "permission": conn.permission,
                        "groupId": conn.group.groupId,
                        "groupName": conn.group.groupName,
                        "schedules": conn.group.groupscheduleconns.map(gsc => 
                            {
                                return (
                                {
                                    "scheduleId": gsc.schedule.scheduleId,
                                    "scheduleInfo": gsc.schedule.scheduleInfo,
                                    "template": {
                                    "templateId": gsc.schedule.templates.templateId,
                                    "templateInfo": gsc.schedule.templates.templateInfo
                                    }
                                })
                            })
                        }
                    this.groups.push(group);
                }   
                else
                {
                    var pendingGroup = 
                    {
                        "permission": conn.permission,
                        "groupId": conn.groupId,
                        "groupName": conn.group.groupName,
                    }
                    this.pendingGroups.push(pendingGroup);
                }
                
                return group;
            });
            

        
        //console.log(this);
    }

    //true ha vannak értesítése false, ha nincsnek

    async hasNotifications(callApiFunc) {
        let result = this.pendingGroups.length > 0;
        let overLaps = await this.callApi.callApiAsync("AdvancedInfo/OverLaps", "GET", null, true, this.callApi._token);
        let i = 0;
        while(!result && i < overLaps.length)
            {
                console.log()
                if(overLaps[i].filter(ol => !ol.isIgnored).length > 1) { result = true};
                i++;
            }


        
        //console.log("hasNotifications: ");
        //console.log(result);



        return result;
    }
}


/*
-----------------------------------------------------------------------
        RESPONSE STRUCTURE EXAMPLE
-----------------------------------------------------------------------

    "userId": 1,
    "userName": "hehehe",
    "email": "IstvanTheSaint@magyar.kiraly.hu",
    "displayName": "Asd_asdasd",
    "password": "",
    "description": "Empty Description",
    "role": "Admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiSXN0dmFuVGhlU2FpbnRAbWFneWFyLmtpcmFseS5odSIsInBlcm1pc3Npb24iOlsiR3JvdXBzLkNyZWF0ZSIsIkdyb3Vwcy5SZWFkIiwiR3JvdXBzLlVwZGF0ZSIsIkdyb3Vwcy5EZWxldGUiLCJTY2hlZHVsZXMuQ3JlYXRlIiwiU2NoZWR1bGVzLlJlYWQiLCJTY2hlZHVsZXMuVXBkYXRlIiwiU2NoZWR1bGVzLkRlbGV0ZSIsIlRlbXBsYXRlcy5DcmVhdGUiLCJUZW1wbGF0ZXMuUmVhZCIsIlRlbXBsYXRlcy5VcGRhdGUiLCJUZW1wbGF0ZXMuRGVsZXRlIiwiVXNlcnMuQ3JlYXRlIiwiVXNlcnMuUmVhZCIsIlVzZXJzLlVwZGF0ZSIsIlVzZXJzLkRlbGV0ZSIsIlVzZXJTZXR0aW5ncy5DcmVhdGUiLCJVc2VyU2V0dGluZ3MuUmVhZCIsIlVzZXJTZXR0aW5ncy5VcGRhdGUiLCJVc2VyU2V0dGluZ3MuRGVsZXRlIiwiQWR2YW5jZWRJbmZvLlJlYWQiLCJBZHZhbmNlZEluZm8uUmVhZEJ5VG9rZW4iLCJBZHZhbmNlZEluZm8uQ3JlYXRlIiwiQWR2YW5jZWRJbmZvLlVwZGF0ZSIsIkFkdmFuY2VkSW5mby5EZWxldGUiLCJCbG9ja3MuQ3JlYXRlIiwiQmxvY2tzLlJlYWQiLCJCbG9ja3MuVXBkYXRlIiwiQmxvY2tzLkRlbGV0ZSIsIlNjaGVkdWxlQmxvY2suUmVhZCJdLCJleHAiOjE3NzE5MjU3NzQsImlzcyI6IkhCU1oiLCJhdWQiOiIxM0EifQ.fd5k6LSn-vMdrClR0g0UL9PZBiuF5Z3sizB7UDtu78Q",
    "usersettings": {
        "userId": 1,
        "settings": ""
    },
    "schedulesusersconns": [
        {
            "userId": 1,
            "scheduleId": 1,
            "schedules": {
                "templateId": 1,
                "scheduleInfo": "Empty_Schedule",
                "scheduleId": 1,
                "templates": {
                    "templateId": 1,
                    "templateInfo": "Empty_Template",
                    "schedules": [
                        null
                    ]
                }
            }
        }
    ],
    "groupuserconns": [
        {
            "userId": 1,
            "groupId": 1,
            "permission": "user",
            "group": {
                "groupId": 1,
                "groupName": "Default_Group",
                "groupscheduleconns": [
                    {
                        "groupId": 1,
                        "scheduleId": 1,
                        "schedule": {
                            "templateId": 1,
                            "scheduleInfo": "Empty_Schedule",
                            "scheduleId": 1,
                            "templates": {
                                "templateId": 1,
                                "templateInfo": "Empty_Template",
                                "schedules": [
                                    null
                                ]
                            }
                        }
                    }
                ],
                "groupuserconns": [
                    null
                ]
            }
        }
    ]
}
*/