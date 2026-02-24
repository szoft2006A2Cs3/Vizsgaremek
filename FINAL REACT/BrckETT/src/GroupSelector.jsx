import './css/GroupSelector.css';
import { useNavigate } from "react-router-dom";

// ONLCICKRE AZ ONCLICKHANDE FUNCTIONT ALLITSD BE, A KARTYAKNAK A NEVEBE LEGYEN EGY DATA-ATTRIBUTE 
// AMI A CSOPORT ID-JET TARTALMAZZA, ES AZT ADJA AT A FENTI FUNCTIONNEK, AMI BEALLITJA A SELECTEDGROUPID-ET, 
// ES AZT FELHASZNALVA LEHET BETOLTENI A CSOPORTHOZ TARTOZO ADATOKAT



export default function GroupSelector({groupList}) 
{
    const navigate = useNavigate();
    //Atvaltja az ID-t a jo groupra, majd az URL-t
    function OnClickHandler(group)
    {
        navigate('/Schedules', {
            state: {
                schedulesList: group.schedules
            }
        });
    }

    return (
        <div className='groupSelector-container'>
            {(groupList || []).map((group) => (
                <div
                    key={group.groupId}
                    data-group-id={group.groupId}
                    onClick={() => OnClickHandler(group)}
                >
                    {group.groupName}
                </div>
            ))}
        </div>
    );
}