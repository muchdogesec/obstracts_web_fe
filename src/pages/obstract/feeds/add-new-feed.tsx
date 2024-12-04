import React, { useEffect } from "react";
import {
    Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddEntryDialog from "./feed-modal.tsx";


function AddNewFeed() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'Add a New Feed | Obstracts Web'
    }, [])


    return (
        <Container>
            <AddEntryDialog
                open={true}
                onClose={() => navigate(-1)}
                onAddEntry={() => navigate(-1)}
            />
        </Container>
    );
}

export default AddNewFeed;
