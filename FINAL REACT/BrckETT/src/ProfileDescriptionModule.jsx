import './css/ProfileDescriptionModule.css';
import { Link } from "react-router-dom";

function formatDisplayText(value) {
    return value?.replaceAll('_', ' ') || 'Untitled';
}

export default function ProfileDescriptionModule({ userData }) {
    const user = userData?.user;
    const groups = userData?.groups ?? [];
    const totalSchedules = groups.reduce((sum, group) => sum + (group.schedules?.length ?? 0), 0);
    const description = user?.description?.trim();

    return (
        <div className="profile-description-page">
            <div className="profile-description-layout">
                <Link className="profile-description-backButton" to="/">
                    Back to profile
                </Link>

                <section className="profile-description-summarySection profile-description-panel">
                    <div className="profile-description-userHeader">
                        <img
                            className="profile-description-avatar"
                            src={user?.img || '/src/assets/Brckett Logo.png'}
                            alt="Profile avatar"
                        />
                        <div>
                            <span className="profile-description-sectionTag">Profile</span>
                            <h1>{user?.displayName || 'Loading...'}</h1>
                            <p>@{user?.username || 'username'}</p>
                        </div>
                    </div>

                    <div className="profile-description-statsGrid">
                        <article className="profile-description-statTile">
                            <span>Groups</span>
                            <strong>{groups.length}</strong>
                        </article>
                        <article className="profile-description-statTile">
                            <span>Shared schedules</span>
                            <strong>{totalSchedules}</strong>
                        </article>
                    </div>
                </section>

                <div className="profile-description-contentGrid">
                    <section className="profile-description-contentSection profile-description-panel">
                        <div className="profile-description-sectionHeader">
                            <div>
                                <span className="profile-description-sectionTag">About</span>
                                <h2>Description</h2>
                            </div>
                            <Link className="profile-description-sectionLink" to="/Settings">
                                Edit in settings
                            </Link>
                        </div>

                        <p className={`profile-description-bodyText${description ? '' : ' is-empty'}`}>
                            {description || 'No description added yet. You can write one in Settings and it will show up here.'}
                        </p>
                    </section>

                    <section className="profile-description-contentSection profile-description-panel">
                        <div className="profile-description-sectionHeader">
                            <div>
                                <span className="profile-description-sectionTag">Shared spaces</span>
                                <h2>Your groups</h2>
                            </div>
                            <Link className="profile-description-sectionLink" to="/Groups">
                                Open groups
                            </Link>
                        </div>

                        {groups.length === 0 ? (
                            <p className="profile-description-bodyText is-empty">
                                You are not in any groups yet.
                            </p>
                        ) : (
                            <div className="profile-description-groupEntries">
                                {groups.map((group) => (
                                    <article className="profile-description-groupEntry" key={group.groupId}>
                                        <div>
                                            <h3>{formatDisplayText(group.groupName)}</h3>
                                            <p>{group.schedules?.length ?? 0} shared schedule{(group.schedules?.length ?? 0) === 1 ? '' : 's'}</p>
                                        </div>
                                        <span className="profile-description-groupRole">
                                            {formatDisplayText(group.permission)}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}