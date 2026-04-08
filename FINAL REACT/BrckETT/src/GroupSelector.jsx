import './css/GroupSelector.css';
import { useNavigate } from "react-router-dom";
import { use, useEffect, useState } from 'react';

export default function GroupSelector({OWNuserId, groupList, callAPIFunc, fetchUserDataFunc})
{
    const navigate = useNavigate();
    const groups = groupList ?? [];
    const totalSchedules = groups.reduce((sum, group) => sum + (group.schedules?.length ?? 0), 0);


    const [invitePopUp, setInvitePopup] = useState("hidden");
    const [editPopUp, setEditPopup] = useState("hidden");
    const [createPopUp, setCreatePopup] = useState("hidden");
    const [createGroupName, setCreateGroupName] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [editGroupName, setEditGroupName] = useState("");

    function formatDisplayText(value)
    {
        return value?.replaceAll('_', ' ') || 'Untitled';
    }

    function getGroupInitials(groupName)
    {
        return formatDisplayText(groupName)
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((segment) => segment[0]?.toUpperCase())
            .join('') || 'GR';
    }

    function getGroupPreview(group)
    {
        if (!group.schedules || group.schedules.length === 0) {
            return 'This group is ready for new schedules and shared planning.';
        }

        const previewSchedules = group.schedules
            .slice(0, 2)
            .map((schedule) => formatDisplayText(schedule.scheduleInfo))
            .join(' and ');

        return `Contains ${previewSchedules}${group.schedules.length > 2 ? ' and more' : ''}.`;
    }

    function handleSelectGroup(groupId)
    {
        const selectedGroup = groups.find(
            group => group.groupId === groupId
        );

        
        if (!selectedGroup) return;

        navigate('/Schedules', {
            state: {
                selectedGroupId: selectedGroup.groupId,
            }
        });
    }
    


    async function handleInvite(groupId)
    {
        //console.log(`Inviting ${inviteEmail} to group ${groupId}`);

        var res = await callAPIFunc.callApiAsync("AdvancedInfo/groupInvite", "POST", null, false, callAPIFunc._token + "/" + groupId + "/" + inviteEmail)
        if(res.substring(0, 1) === "@")
        {
            alert("Invite failed! (already invited)");
        }
        else if(res.substring(0, 1) === "!")
        {
            alert("Invite successful!");
        }
        else
        {
            alert("Invite failed! (user not found)");
        }
        setInviteEmail("");
        setInvitePopup("hidden");
    }

    async function handleCreateGroup()
    {
        await callAPIFunc.callApiAsync("AdvancedInfo/groupCreate", "POST", {groupName: createGroupName}, false, callAPIFunc._token)
        alert("Group creation successful!");
        setCreateGroupName("");
        setCreatePopup("hidden");
    }

    const [members, setMembers] = useState([]);
    //useEffect(() => {console.log(members)}, [members])



    useEffect((
       
    ) => {
        if(selectedGroupId === null) return;
        async function fetchMembers() {
            setMembers((await callAPIFunc.callApiAsync("AdvancedInfo/Members", "GET", null, true, callAPIFunc._token + "/" + selectedGroupId)).filter(m => m.permission != "pending"));
        }
        fetchMembers();
        //console.log(members);
    }, [editPopUp])

    const [selectorValues, setSelectorValues] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);

    async function handleEditGroup()
    {
        //Backendre feltöltés
        let res = []
        for(const elem in selectorValues)
            {
                res.push({
                    userId: elem,
                    permission: selectorValues[elem]
                })
            }
        //console.log(res);

        await callAPIFunc.callApiAsync("AdvancedInfo/EditGroup", "PUT", res, false, callAPIFunc._token + "/" + selectedGroupId + "/" + editGroupName)

        fetchUserDataFunc();
        setEditPopup("hidden");
        setSelectorValues({});
        setSelectedGroupId(null);
    }



    useEffect(() => {
        setSelectorValues(members.filter(m => m.permission != "pending").reduce((acc, member) => ({...acc, [member.userId]: member.permission}), {}));
    }, [members])

    function renderMembers() {
        if(members.length < 5) {
            return members.filter(m => m.permission != "pending").map((member, ix) => (
                                    <div key={ix} className={`edit-grid-row ${member.userId === OWNuserId ? 'own-user' : ''}`} >
                                        <span>{member.userName}</span>
                                        <select value={selectorValues[member.userId] || member.permission} onChange={(e) => setSelectorValues(prev => ({...prev, [member.userId]: e.target.value}))}>
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Remove">Remove</option>
                                        </select>
                                    </div>))
        
        }
        else {
            return( 
            <div className='edit-grid-row'>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    {
                        members.filter(m => m.permission != "pending").map((member, ix) => (
                            <option key={member.userId} value={member.userId} className={member.userId === OWNuserId ? 'own-user' : ''}>
                                {member.userName}
                            </option>
                        ))
                    }
                </select>
                <select value={selectorValues[selectedUserId]} onChange={(e) => setSelectorValues(prev => ({...prev, [selectedUserId]: e.target.value}))}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Remove">Remove</option>
                </select>
            </div>
            )
        }
    
    }



    return (
        <div className='groupSelector-page'>
            <div className='groupSelector-shell'>
                <div className='groupSelector-hero'>
                    <div className='groupSelector-titleBlock'>
                        <span className='groupSelector-chip'>Collaboration Hub</span>
                        <h1>Groups</h1>
                        <p>Jump between shared workspaces, see how much planning lives in each group, and move directly into the schedule view.</p>
                    </div>
                    <div className='groupSelector-summary'>
                        <div className='groupSelector-summaryCard'>
                            <span className='groupSelector-summaryLabel'>Active Groups</span>
                            <strong>{groups.length}</strong>
                            <p>Shared spaces currently connected to your account.</p>
                        </div>
                        <div className='groupSelector-summaryCard'>
                            <span className='groupSelector-summaryLabel'>Linked Schedules</span>
                            <strong>{totalSchedules}</strong>
                            <p>Total schedules distributed across all your groups.</p>
                        </div>
                    </div>
                </div>

                {groups.length === 0 ? (
                    <div className='groupSelector-emptyState'>
                        <span className='groupSelector-chip'>No Groups Yet</span>
                        <h2>Your collaboration area is empty.</h2>
                        <p>Once you join or create a group, it will appear here with direct access to its schedules.</p>
                    </div>
                ) : (
                    <div className='groupSelector-container'>
                        {groups.map((group) => (
                            <div className='group-card-shell' key={group.groupId}>
                                <article className="group-card" onClick={() => handleSelectGroup(group.groupId)}>
                                    <div className='group-card-top'>
                                        <div className='group-card-badge'>{getGroupInitials(group.groupName)}</div>
                                        <div className='group-card-meta'>
                                            <span className='group-card-permission'>{formatDisplayText(group.permission)}</span>
                                            <span className='group-card-count'>{group.schedules?.length ?? 0} schedule{(group.schedules?.length ?? 0) === 1 ? '' : 's'}</span>
                                        </div>
                                    </div>

                                    <div className='group-card-content'>
                                        <h2>{formatDisplayText(group.groupName)}</h2>
                                        <p>{getGroupPreview(group)}</p>
                                    </div>

                                    <div className='group-card-preview' >
                                        {(group.schedules ?? []).slice(0, 3).map((schedule) => (
                                            <span className='group-schedule-chip' key={schedule.scheduleId}>
                                                {formatDisplayText(schedule.scheduleInfo)}
                                            </span>
                                        ))}
                                        {(group.schedules?.length ?? 0) > 3 && (
                                            <span className='group-schedule-chip muted'>+{group.schedules.length - 3} more</span>
                                        )}
                                        {(group.schedules?.length ?? 0) === 0 && (
                                            <span className='group-schedule-chip muted'>No schedules yet</span>
                                        )}


                                    </div>
                                    <div className='group-card-actions'>
                                    <button
                                        className="group-primary-btn"
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedGroupId(group.groupId);
                                            setEditGroupName(group.groupName);
                                            setEditPopup("visible");
                                        }}
                                    >
                                        Edit Group
                                    </button>

                                    <button
                                        className="group-secondary-btn"
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedGroupId(group.groupId);
                                            setInvitePopup("visible");
                                            //console.log("Invite:", group.groupId);
                                        }}
                                    >
                                        Invite
                                    </button>
                                </div>
                                
                                </article>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    className="group-primary-btn group-card-cta"
                    type="button"
                    onClick={() => {
                        setSelectedGroupId(null);
                        setCreatePopup("visible");
                    }}>
                    New Group
                    </button>
            </div>
            {editPopUp === "visible" && (
                <div className="popup-overlay edit-overlay" onClick={() => setEditPopup("hidden")}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Group</h2>
                        <p>Editing {`\"${groupList.filter(g => g.groupId === selectedGroupId)[0]?.groupName}.\"`}</p>

                        <input type="text" placeholder="Group name" className='group-name-input' value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)}/>

                        <div className='edit-grid'>
                            <div className='edit-grid-row edit-grid-header'>
                                <span>Members:</span>
                                <span>Permission:</span>
                            </div>
                            {
                                renderMembers()
                            }
                        </div>


                        <button className='delete-grp-btn'>DELETE</button>
                        <div className='edit-inputs'>
                            <button onClick={() => handleEditGroup()}>Save Changes</button>
                            <button onClick={() => {setEditPopup("hidden"); setSelectorValues({});}}>Close</button>
                        </div>
                        
                    </div>
                </div>
            )}
            {invitePopUp === "visible" && (
                <div className="popup-overlay invite-overlay"  onClick={() => setInvitePopup("hidden")}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Invite to Group</h2>
                        <p>Enter the email addresses of the people you want to invite:</p>
                        <input type="text" placeholder="Email address" className='email-input' value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}/>
                        
                        <div className='invite-inputs'>
                            <button onClick={() => handleInvite(selectedGroupId)}>Invite</button>
                            <button onClick={() => setInvitePopup("hidden")}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {createPopUp === "visible" && (
                <div className="popup-overlay create-overlay"  onClick={() => setCreatePopup("hidden")}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create Group</h2>
                        <p>Enter the details for your new group:</p>
                        <input type="text" placeholder="Group name" className='group-name-input' value={createGroupName} onChange={(e) => setCreateGroupName(e.target.value)}/>
                        <div className='create-inputs'>
                            <button onClick={() => handleCreateGroup()}>Create</button>
                            <button onClick={() => setCreatePopup("hidden")}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}