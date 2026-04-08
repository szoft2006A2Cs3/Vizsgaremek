import './css/GroupSelector.css';
import { useNavigate } from "react-router-dom";

export default function GroupSelector({ groupList }) 
{
    const navigate = useNavigate();
    const groups = groupList ?? [];
    const totalSchedules = groups.reduce((sum, group) => sum + (group.schedules?.length ?? 0), 0);


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
                                <article className="group-card">
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

                                    <div className='group-card-preview'>
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
                                            handleSelectGroup(group.groupId);
                                        }}
                                    >
                                        Open schedules
                                    </button>

                                    <button
                                        className="group-secondary-btn"
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            console.log("Invite:", group.groupId);
                                        }}
                                    >
                                        Invite
                                    </button>
                                </div>
                                </article>

                                <button
                                    className="group-primary-btn group-card-cta"
                                    type="button"
                                >
                                    New Group
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className='groupSelector-nav'>
                    <button
                        className='group-secondary-btn groupSelector-backBtn'
                        type='button'
                        onClick={() => navigate('/')}
                    >
                        Back to profile
                    </button>
                </div>
            </div>
        </div>
    );
}