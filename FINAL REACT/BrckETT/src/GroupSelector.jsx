import './css/GroupSelector.css';
import { useNavigate } from "react-router-dom";

export default function GroupSelector({ groupList }) 
{
    const navigate = useNavigate();


    function OnClickHandler(event)
    {
        
        const groupId = event.currentTarget.getAttribute('data-group-id');
        
        const selectedGroup = groupList.find(
            g => g.groupId == groupId
        );

        
        if (!selectedGroup) return;

        navigate('/Schedules', {
            state: {
                selectedGroupId: selectedGroup.groupId,
            }
        });
    }

    return (
        <div className='groupSelector-container'>
            {(groupList || []).map((group) => (
                <div
                    key={group.groupId}
                    data-group-id={group.groupId}
                    onClick={OnClickHandler}
                    className="group-card"
                >
                {group.groupName}

                <button
                    className="invite-btn"
                    onClick={(e) => {
                    e.stopPropagation(); // fontos!
                    console.log("Invite:", group.groupId);
                    }}
                >Invite</button>
                </div>
            ))}
        </div>
    );
}