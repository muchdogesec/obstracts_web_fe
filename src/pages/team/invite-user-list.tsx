import React, { useState } from "react";
import {
    Box,
    Button,
} from "@mui/material";
import InviteUserLine from "./invite-user-line.tsx";
import { Api } from '../../services/api.ts';
import { useAlert } from '../../contexts/alert-context.tsx';
import LoadingButton from "../../components/loading_button/index.tsx";

interface InviteUserListProps {
    teamId: string;
    onComplete: () => void;
    isOwner: boolean;
}

function InviteUserList({ teamId, onComplete, isOwner }: InviteUserListProps) {
    const [loading, setLoading] = useState(false)
    const [invites, setInvites] = useState<{
        role: string,
        email: string,
    }[]>([{ role: 'member', email: '' }])
    const [error, setError] = useState('')
    const alert = useAlert()

    const addNewLine = () => {
        setInvites(invites => ([...invites, { role: 'member', email: '' }]))
    }

    const onItemChanged = (index: number, field: string, value: string) => {
        setInvites(invites => {
            return [
                ...invites.slice(0, index),
                { ...invites[index], [field]: value },
                ...invites.slice(index + 1)
            ]
        })
    }

    const onRemove = (index: number) => {
        setInvites(invites => {
            return [
                ...invites.slice(0, index),
                ...invites.slice(index + 1)
            ]
        })
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[\w.-/+]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    const sendInvites = async () => {
        setError("")
        const emailsValid = invites.map(invite => validateEmail(invite.email))
        if (emailsValid.includes(false)) {
            setError('Invalid email in request')
            return
        }
        try {
            setLoading(true)
            const requestBody = invites.map(invite => ({ email: invite.email, role: invite.role }))
            await Api.bulkInviteUser(teamId, requestBody)
            onComplete()
            setInvites([{ email: '', role: 'member' }])
        } catch (err) {
            if (err?.response?.status === 400) {
                if (err?.response?.data?.code === "E01") {
                    alert.showAlert(err?.response?.data?.message)
                    setError(err?.response?.data?.message)
                } else {
                    const errors = err?.response?.data?.email
                    setError(errors[0])
                }
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        <Box>
            {invites.map((item, index) => (
                <InviteUserLine key={index} email={item.email} role={item.role}
                    onEmailChanged={(email) => onItemChanged(index, 'email', email)}
                    onRoleChanged={(role) => onItemChanged(index, 'role', role)}
                    onRemove={() => { onRemove(index) }}
                    isOwner={isOwner}
                ></InviteUserLine>
            ))}
            <Box sx={{ color: 'red' }}>{error}</Box>
            <Button sx={{ marginRight: '1rem', textTransform: 'none' }} onClick={() => addNewLine()}> + Add new row </Button> <br/>
            <LoadingButton variant="contained" isLoading={loading} onClick={() => sendInvites()}> Send invites </LoadingButton>
        </Box>
    );
}

export default InviteUserList;
