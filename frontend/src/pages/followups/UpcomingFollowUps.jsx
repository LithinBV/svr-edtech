import React from "react";
import FollowUpsPage from "./FollowUpsPage";

const UpcomingFollowUps = () => {
    return (
        <FollowUpsPage
            type="UPCOMING"
            title="Upcoming Follow Ups"
            description="Follow-up tasks scheduled for future dates."
        />
    );
};

export default UpcomingFollowUps;