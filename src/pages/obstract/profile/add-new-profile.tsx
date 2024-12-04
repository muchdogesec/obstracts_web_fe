import React, { useEffect } from "react";
import {
    Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddEntryDialog from "./add_dialog.tsx";


function ObstractsProfileAdd() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'Add a New Extraction Profile | Obstracts Web'
    }, [])


    return (
        <Container>
            <AddEntryDialog
                open={true}
                onClose={() => navigate(-1)}
                onAddEntry={() => navigate(-1)}
                entryData={null}
            >
            </AddEntryDialog>
        </Container>
    );
}

export default ObstractsProfileAdd;
