import React, { useEffect, useState } from "react";

import TeamCard from "../components/teams/TeamCard";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import EditTeamModal from "../components/teams/EditTeamModal";

const API_URL = "http://localhost:3000";

const Teams = () => {
    const [teams, setTeams] = useState([]);

    const [managers, setManagers] = useState([]);
    const [executives, setExecutives] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removingExecutive, setRemovingExecutive] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedExecutives, setSelectedExecutives] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [editTeamName, setEditTeamName] = useState("");
    const [editManager, setEditManager] = useState("");
    const [editSelectedExecutives, setEditSelectedExecutives] = useState([]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // LOAD TEAMS
    const loadTeams = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            const response = await fetch(`${API_URL}/api/teams`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load teams");
            }

            setTeams(data.teams || []);

        } catch (error) {
            console.error("Load teams error:", error);

            setError(error.message || "Unable to load teams");

        } finally {
            setLoading(false);
        }
    };

    // LOAD USERS
    const loadUsers = async () => {
        try {
            const token = getToken();

            const response = await fetch(`${API_URL}/api/users`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load users");
            }

            const allUsers = data.users || [];

            // Available managers without teams
            const availableManagers = allUsers.filter(
                (user) =>
                    user.role === "MANAGER" &&
                    !user.team
            );

            setManagers(availableManagers);

            // Available executives without teams
            const availableExecutives = allUsers.filter(
                (user) =>
                    user.role === "EXECUTIVE" &&
                    !user.team
            );

            setExecutives(availableExecutives);

        } catch (error) {
            console.error("Load users error:", error);

            setError(error.message || "Unable to load users");
        }
    };

    // INITIAL LOAD
    useEffect(() => {
        loadTeams();
        loadUsers();
    }, []);

    // CLEAR MESSAGES
    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    // RESET CREATE FORM
    const resetCreateForm = () => {
        setTeamName("");
        setSelectedManager("");
        setSelectedExecutives([]);
    };

    // OPEN CREATE MODAL
    const openCreateModal = async () => {
        clearMessages();
        resetCreateForm();

        await loadUsers();

        setShowCreateModal(true);
    };

    // CLOSE CREATE MODAL
    const closeCreateModal = () => {
        if (saving) return;

        resetCreateForm();
        setShowCreateModal(false);
        setError("");
    };

    // CREATE EXECUTIVE CHECKBOX
    const handleExecutiveChange = (executiveId) => {
        setSelectedExecutives((previous) => {
            if (previous.includes(executiveId)) {
                return previous.filter(
                    (id) => id !== executiveId
                );
            }

            return [
                ...previous,
                executiveId
            ];
        });
    };

    // CREATE TEAM
    const createTeam = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!teamName.trim()) {
            setError("Please enter a team name.");
            return;
        }

        if (!selectedManager) {
            setError("Please select a manager.");
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            // Frontend safety check for manager
            const selectedManagerUser = managers.find(
                (manager) =>
                    String(manager._id || manager.id) ===
                    String(selectedManager)
            );

            if (
                !selectedManagerUser ||
                selectedManagerUser.team
            ) {
                throw new Error(
                    "This Manager is already assigned to a team. Please select another Manager."
                );
            }

            // CREATE TEAM REQUEST
            const response = await fetch(`${API_URL}/api/teams`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    name: teamName.trim(),
                    manager: selectedManager,
                    executives: selectedExecutives
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create team"
                );
            }

            setSuccess("Team created successfully.");

            resetCreateForm();
            setShowCreateModal(false);

            await loadTeams();
            await loadUsers();

        } catch (error) {
            console.error("Create team error:", error);

            setError(
                error.message || "Unable to create team"
            );

        } finally {
            setSaving(false);
        }
    };  
        // OPEN EDIT MODAL
    const openEditModal = async (team) => {
        clearMessages();

        if (!team) {
            return;
        }

        setEditingTeam(team);

        // TEAM NAME
        setEditTeamName(team.name || "");

        // CURRENT MANAGER
        const managerId =
            team.manager?._id ||
            team.manager?.id ||
            team.manager ||
            "";

        setEditManager(String(managerId));

        // CURRENT EXECUTIVES
        const currentExecutiveIds = (
            team.executives || []
        ).map((executive) =>
            String(
                executive._id ||
                executive.id ||
                executive
            )
        );

        setEditSelectedExecutives(currentExecutiveIds);

        // REFRESH USERS
        try {
            const token = getToken();

            const response = await fetch(`${API_URL}/api/users`, {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load users"
                );
            }

            const allUsers = data.users || [];

            // AVAILABLE MANAGERS FOR EDIT
            // Include unassigned managers and current manager
            const availableManagers = allUsers.filter(
                (user) => {
                    if (user.role !== "MANAGER") {
                        return false;
                    }

                    const userId = String(
                        user._id || user.id
                    );

                    const currentManagerId = String(managerId);

                    // Current manager is allowed
                    if (userId === currentManagerId) {
                        return true;
                    }

                    // Other managers must have no team
                    return !user.team;
                }
            );

            setManagers(availableManagers);

            // AVAILABLE EXECUTIVES
            // Include unassigned executives and executives
            // already assigned to this team
            const availableExecutives = allUsers.filter(
                (user) => {
                    if (user.role !== "EXECUTIVE") {
                        return false;
                    }

                    const userTeamId =
                        user.team?._id ||
                        user.team?.id ||
                        user.team ||
                        null;

                    // Executive has no team
                    if (!userTeamId) {
                        return true;
                    }

                    // Executive already belongs to this team
                    return (
                        String(userTeamId) ===
                        String(team._id)
                    );
                }
            );

            setExecutives(availableExecutives);

        } catch (error) {
            console.error(
                "Load users for edit error:",
                error
            );

            setError(
                error.message || "Unable to load users"
            );
        }

        setShowEditModal(true);
    };

    // CLOSE EDIT MODAL
    const closeEditModal = () => {
        if (saving) return;

        setShowEditModal(false);
        setEditingTeam(null);
        setEditTeamName("");
        setEditManager("");
        setEditSelectedExecutives([]);
        setError("");
    };

    // EDIT EXECUTIVE CHECKBOX
    const handleEditExecutiveChange = (executiveId) => {
        const id = String(executiveId);

        setEditSelectedExecutives((previous) => {
            if (previous.includes(id)) {
                return previous.filter(
                    (existingId) => existingId !== id
                );
            }

            return [
                ...previous,
                id
            ];
        });
    };

    // UPDATE TEAM
    const updateTeam = async (event) => {
        event.preventDefault();

        if (!editingTeam) {
            return;
        }

        clearMessages();

        // VALIDATE NAME
        if (!editTeamName.trim()) {
            setError("Please enter a team name.");
            return;
        }

        // VALIDATE MANAGER
        if (!editManager) {
            setError("Please select a manager.");
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            // CURRENT MANAGER ID
            const currentManagerId = String(
                editingTeam.manager?._id ||
                editingTeam.manager?.id ||
                editingTeam.manager ||
                ""
            );

            // IF CHANGING MANAGER
            if (
                String(editManager) !==
                currentManagerId
            ) {
                const selectedManagerUser = managers.find(
                    (manager) =>
                        String(
                            manager._id ||
                            manager.id
                        ) === String(editManager)
                );

                if (!selectedManagerUser) {
                    throw new Error(
                        "Selected Manager is not available."
                    );
                }

                if (selectedManagerUser.team) {
                    const selectedManagerTeamId =
                        selectedManagerUser.team?._id ||
                        selectedManagerUser.team?.id ||
                        selectedManagerUser.team;

                    if (
                        String(selectedManagerTeamId) !==
                        String(editingTeam._id)
                    ) {
                        throw new Error(
                            "This Manager is already assigned to another team."
                        );
                    }
                }
            }

            // UPDATE TEAM NAME + MANAGER
            const updateResponse = await fetch(
                `${API_URL}/api/teams/${editingTeam._id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: editTeamName.trim(),
                        manager: editManager
                    })
                }
            );

            const updateData = await updateResponse.json();

            if (!updateResponse.ok) {
                throw new Error(
                    updateData.message || "Failed to update team"
                );
            }

            // CURRENT EXECUTIVES
            const currentExecutiveIds = (
                editingTeam.executives || []
            ).map((executive) =>
                String(
                    executive._id ||
                    executive.id ||
                    executive
                )
            );

            // SELECTED EXECUTIVES
            const selectedExecutiveIds =
                editSelectedExecutives.map((id) => String(id));

            // FIND EXECUTIVES TO ADD
            const executivesToAdd =
                selectedExecutiveIds.filter(
                    (id) =>
                        !currentExecutiveIds.includes(id)
                );

            // FIND EXECUTIVES TO REMOVE
            const executivesToRemove =
                currentExecutiveIds.filter(
                    (id) =>
                        !selectedExecutiveIds.includes(id)
                );

            // ADD EXECUTIVES
            for (const executiveId of executivesToAdd) {
                const response = await fetch(
                    `${API_URL}/api/teams/${editingTeam._id}/executives`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            userId: executiveId
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to add executive"
                    );
                }
            }

            // REMOVE EXECUTIVES
            for (const executiveId of executivesToRemove) {
                const response = await fetch(
                    `${API_URL}/api/teams/${editingTeam._id}/executives/${executiveId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to remove executive"
                    );
                }
            }

            // SUCCESS
            setSuccess("Team updated successfully.");

            // Reset edit modal
            setShowEditModal(false);
            setEditingTeam(null);
            setEditTeamName("");
            setEditManager("");
            setEditSelectedExecutives([]);

            // REFRESH
            await loadTeams();
            await loadUsers();

        } catch (error) {
            console.error("Update team error:", error);

            setError(
                error.message || "Unable to update team"
            );

        } finally {
            setSaving(false);
        }
    };
        // DELETE TEAM
    const deleteTeam = async (teamId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this team? The manager and all executives in this team will become available again."
        );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            const token = getToken();

            const response = await fetch(
                `${API_URL}/api/teams/${teamId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete team"
                );
            }

            setSuccess(
                "Team deleted successfully. Manager and executives are available again."
            );

            await loadTeams();
            await loadUsers();

        } catch (error) {
            console.error("Delete team error:", error);

            setError(
                error.message || "Unable to delete team"
            );
        }
    };

    // REMOVE EXECUTIVE
    const removeExecutive = async (
        teamId,
        executiveId,
        executiveName
    ) => {
        const confirmed = window.confirm(
            `Remove ${executiveName || "this executive"} from this team? They will become available for another team.`
        );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            setRemovingExecutive(executiveId);

            const token = getToken();

            const response = await fetch(
                `${API_URL}/api/teams/${teamId}/executives/${executiveId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to remove executive"
                );
            }

            setSuccess(
                `${executiveName || "Executive"} was removed from the team and is available again.`
            );

            await loadTeams();
            await loadUsers();

        } catch (error) {
            console.error("Remove executive error:", error);

            setError(
                error.message || "Unable to remove executive"
            );

        } finally {
            setRemovingExecutive("");
        }
    };

    // PAGE
    return (
        <div className="min-h-full bg-slate-50 p-6 lg:p-8">

            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Teams
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage managers, executives and teams.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    <span className="text-lg leading-none">
                        +
                    </span>

                    Create Team
                </button>
            </div>

            {/* SUCCESS MESSAGE */}
            {success && (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {success}
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error &&
                !showCreateModal &&
                !showEditModal && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

            {/* LOADING */}
            {loading ? (

                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <div className="text-sm text-slate-500">
                        Loading teams...
                    </div>
                </div>

            ) : teams.length === 0 ? (

                /* EMPTY STATE */
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center shadow-sm">

                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                        👥
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                        No teams created yet
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Create your first team to start assigning managers and executives.
                    </p>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        + Create Team
                    </button>
                </div>

            ) : (

                /* TEAM GRID */
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">

                    {teams.map((team) => (
                        <TeamCard
                            key={team._id}
                            team={team}
                            removingExecutive={removingExecutive}
                            onEdit={openEditModal}
                            onDelete={deleteTeam}
                            onRemoveExecutive={removeExecutive}
                        />
                    ))}

                </div>
            )}
                        {/* CREATE TEAM MODAL */}
            <CreateTeamModal
                show={showCreateModal}
                teamName={teamName}
                selectedManager={selectedManager}
                selectedExecutives={selectedExecutives}
                managers={managers}
                executives={executives}
                saving={saving}
                error={showCreateModal ? error : ""}
                onClose={closeCreateModal}
                onSubmit={createTeam}
                onTeamNameChange={setTeamName}
                onManagerChange={setSelectedManager}
                onExecutiveChange={handleExecutiveChange}
            />

            {/* EDIT TEAM MODAL */}
            <EditTeamModal
                show={showEditModal}
                editingTeam={editingTeam}
                editTeamName={editTeamName}
                editManager={editManager}
                editSelectedExecutives={editSelectedExecutives}
                managers={managers}
                executives={executives}
                saving={saving}
                error={showEditModal ? error : ""}
                onClose={closeEditModal}
                onSubmit={updateTeam}
                onTeamNameChange={setEditTeamName}
                onManagerChange={setEditManager}
                onExecutiveChange={handleEditExecutiveChange}
            />

        </div>
    );
};

export default Teams;