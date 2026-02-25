import './css/GroupSelector.css';
import { useNavigate } from "react-router-dom";

export default function GroupSelector({ groupList }) 
{
    const navigate = useNavigate();
    console.log(groupList);


    function OnClickHandler(event)
    {
        const groupId = Number(event.currentTarget.dataset.groupId);

        const selectedGroup = groupList.find(
            g => g.groupId === groupId
        );

        if (!selectedGroup) return;

        navigate('/Schedules', {
            state: {
                selectedGroupId: selectedGroup.groupId,
                schedulesList: selectedGroup.schedules
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
                </div>
            ))}
        </div>
    );
}