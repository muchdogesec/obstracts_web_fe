import React, { useEffect, useState } from "react";
import {
    Container,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddEntryDialog from "./feed-modal.tsx";
import { Feed, fetchObstractFeed } from "../../../services/obstract.ts";


function EditFeed() {
    const { feedId } = useParams<{ feedId: string }>();
    const [feed, setFeed] = useState<Feed>({
        profile_id: '',
        polling_schedule_minute: 0,
        is_public: false,
        next_polling_time: '',
        obstract_feed_metadata: {},
    } as any)
    const navigate = useNavigate()

    const loadFeed = async (feedId: string) => {
        const res = await fetchObstractFeed(feedId);
        setFeed(res.data);
    }

    useEffect(() => {
        if (!feedId) return
        loadFeed(feedId)
    }, [feedId])

    useEffect(() => {
        document.title = 'Update Feed | Obstracts Web'
    }, [])


    return (
        <Container>
            <AddEntryDialog
                feed={feed}
                isEdit={true}
                open={true}
                onClose={() => navigate(-1)}
                onAddEntry={() => navigate(-1)}
            />
        </Container>
    );
}

export default EditFeed;
