import React from "react";
import FollowUpsPage from "./FollowUpsPage";

const TodayFollowUps = () => {
    return (
        <FollowUpsPage
            type="TODAY"
            title="Today Follow Ups"
            description="Follow-up tasks scheduled for today."
        />
    );
};

export default TodayFollowUps;