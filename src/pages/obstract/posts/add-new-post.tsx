import React, { useEffect, useState } from "react";
import {
    Container,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import NewPostModal from "./new-post-modal.tsx";
import { Feed, fetchObstractFeed } from "../../../services/obstract.ts";


function AddNewPost() {
    const { feed_id } = useParams<{ feed_id: string }>();
    const [feed, setFeed] = useState<Feed | null>()
    const navigate = useNavigate()

    const loadFeed = async (feed_id: string) => {
        const res = await fetchObstractFeed(feed_id);
        setFeed(res.data);
    }


    useEffect(() => {
        document.title = `Add a New Post | Obstracts Web`
    }, [feed])

    useEffect(() => {
        if (!feed_id) return
        loadFeed(feed_id)
    }, [feed_id])

    return (
        <Container>
            <NewPostModal
                open={true}
                feedId={feed?.obstract_feed_metadata.id || ''}
                profileId={feed?.profile_id || ''}
                onClose={() => null}
                onPostCreated={() => navigate(-1)}
            />
        </Container>
    );
}

export default AddNewPost;
