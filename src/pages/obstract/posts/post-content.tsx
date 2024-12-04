import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Modal, Box, Container } from '@mui/material';
import { fetchObstractPost, fetchPostObjects, Post } from '../../../services/obstract.ts';
import { useParams } from 'react-router-dom';


const PostContentPage: React.FC = () => {
    const { teamId, feedId, postId } = useParams<{ teamId: string; feedId: string, postId: string }>();
    const [openModal, setOpenModal] = useState(false);
    const [post, setPost] = useState<Post>()


    const loadPost = async () => {
        if (!postId || !feedId) return
        const response = await fetchObstractPost(feedId, postId);
        setPost(response.data)
    }

    useEffect(() => { loadPost() }, [])

    return (
        <Container sx={{ height: 'calc(100vh - 50px)' }}>
            <iframe
                style={{ height: '100%', width: '100%', border: 'none'}}
                src={post?.link}
                title={post?.title}
            />
        </Container>
    );
};

export default PostContentPage;
