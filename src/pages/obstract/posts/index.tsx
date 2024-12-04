import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, CircularProgress, Pagination, FormControlLabel, Switch, TextField, List, ListItem, ListItemText, Modal, Container, TableHead, TableRow, Tab, TableCell, TableBody, Table } from '@mui/material';
import { deleteObstractFeed, Feed, fetchObstractFeed, fetchObstractFeeds, fetchObstractPosts, Post, updateObstractFeeds } from '../../../services/obstract.ts';
import PostCard from './post-card.tsx';
import EditPostModal from './edit-modal.tsx';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NewPostModal from './new-post-modal.tsx';
import PostsTable from '../post_table.tsx';
import { URLS } from '../../../services/urls.ts';
import LoadingButton from '../../../components/loading_button/index.tsx';
import { getDateString } from '../../../services/utils.ts';
import DeleteDialog from './delete-dialog.tsx';

const PostPage: React.FC = () => {
    const { feed_id } = useParams<{ feed_id: string }>(); // `id` corresponds to `:id` in the route
    const [feed, setFeed] = useState<Feed | null>()
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const [page, setPage] = useState<number>(1); // Current page
    const [pageSize] = useState<number>(10); // Posts per page
    const [totalPages, setTotalPages] = useState<number>(1); // Total pages
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [openNewPostModal, setOpenNewPostModal] = useState(false);
    const [loadEditButton, setLoadEditButton] = useState(false);
    const [disableEdit, setDisableEdit] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const navigate = useNavigate()

    const loadFeed = async (feed_id: string) => {
        const res = await fetchObstractFeed(feed_id);
        setFeed(res.data);
    }

    const loadData = async (feed_id: string, pageNumber: number) => {
        setLoading(true);
        await loadFeed(feed_id)
        setLoading(false);
    };

    useEffect(() => {
        if (!feed_id) return;
        loadData(feed_id, page);
    }, [feed_id, page]);

    useEffect(() => {
        document.title = `${feed?.obstract_feed_metadata['title']} | Obstracts Web`
    }, [feed])

    if (!feed_id) {
        return <div></div>
    }

    const handleOpenModal = (post?: Post) => {
        setSelectedPost(post || null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedPost(null);
    };

    const handleOnSave = () => {
        setModalOpen(false);
        loadData(feed_id, page)
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value); // Update current page
    };

    const isPublicChanged = (ev) => {
        if (!feed) return
        setFeed({ ...feed, is_public: ev.target.value })
    }

    const pollingMinuteChanged = (ev) => {
        if (!feed) return
        setFeed({ ...feed, polling_schedule_minute: ev.target.value })
    }

    const updateFeed = async () => {
        if (!feed) return
        setLoadEditButton(true)
        await updateObstractFeeds(feed.id, feed.is_public, feed.polling_schedule_minute)
        setLoadEditButton(false)
        setDisableEdit(true)
    }
    const handleDelete = async () => {
        setOpenDeleteDialog(true);
    };

    return (
        <Container>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography variant="h4" gutterBottom>
                        {feed?.obstract_feed_metadata.title}
                        <Button sx={{ marginLeft: '3rem', textTransform: 'uppercase' }} variant='contained' color="error" onClick={handleDelete}>Delete Feed</Button>
                        <Button sx={{ marginLeft: '3rem', textTransform: 'uppercase' }} variant='contained' color="success" onClick={() => navigate('add-post')}>Add Post</Button>
                    </Typography>
                </Box>
                <Box>
                    <Typography>
                        {feed?.obstract_feed_metadata.description}
                    </Typography>
                </Box>
            </Box>
            <Table sx={{ marginTop: '1rem', marginBottom: '2rem' }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Feed Setting</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Feed URL</TableCell>
                        <TableCell>{feed?.obstract_feed_metadata.url}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Pretty URL</TableCell>
                        <TableCell>{feed?.obstract_feed_metadata.pretty_url}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Feed Type</TableCell>
                        <TableCell>{feed?.obstract_feed_metadata.feed_type}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Next Update Date</TableCell>
                        <TableCell>{getDateString(feed?.next_polling_time)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Link to={URLS.staffObstractJobs(feed_id)}>
                <Button variant='contained' sx={{ textTransform: 'uppercase' }}>Feed jobs</Button>
            </Link>

            <Box sx={{ display: 'flex', marginTop: '2rem' }}>
                <Box>
                    <Typography>Is public?</Typography>
                    <FormControlLabel

                        control={
                            <Switch
                                disabled={disableEdit}
                                checked={feed?.is_public}
                                color="primary"
                                onChange={(ev) => isPublicChanged(ev)}
                            />
                        }
                        label="Is public"
                    />
                </Box>
                <Box>
                    <TextField
                        disabled={disableEdit}
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Polling schedule (minutes)"
                        type="number"
                        fullWidth
                        value={feed?.polling_schedule_minute}
                        onChange={(ev) => { pollingMinuteChanged(ev) }}
                        required
                    />
                </Box>
            </Box>
            {disableEdit ? (
                <Button variant='contained' color='primary' onClick={() => setDisableEdit(false)}>Edit Settings</Button>
            ) : (
                <LoadingButton isLoading={loadEditButton} variant='contained' color='success' onClick={() => updateFeed()}>Save</LoadingButton>
            )}

            <Typography variant='h5' sx={{ marginTop: '3rem' }}>Posts in this feed</Typography>
            {/* Show loading spinner while data is being fetched */}
            {feed && <PostsTable disabled={false} feedId={feed?.obstract_feed_metadata['id']}></PostsTable>}


            {feed && <DeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                feed={feed}
            />}
            <EditPostModal
                open={modalOpen}
                onClose={handleCloseModal}
                post={selectedPost}
                onSave={handleOnSave}
                feed_id={feed_id}
            />
            <Modal open={openNewPostModal} onClose={() => setOpenNewPostModal(false)}>
                <NewPostModal
                    open={openNewPostModal}
                    feedId={feed?.obstract_feed_metadata.id || ''}
                    profileId={feed?.profile_id || ''}
                    onClose={() => setOpenNewPostModal(false)}
                    onPostCreated={() => loadData(feed_id, page)}
                />
            </Modal>

        </Container>
    );
};

export default PostPage;
