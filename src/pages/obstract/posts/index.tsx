import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, FormControlLabel, Switch, TextField, List, ListItem, ListItemText, Modal, Container, TableHead, TableRow, Tab, TableCell, TableBody, Table, Select, MenuItem } from '@mui/material';
import { Feed, fetchObstractFeed, fetchObstractProfiles, Post, Profile, reloadObstractFeed } from '../../../services/obstract.ts';
import EditPostModal from './edit-modal.tsx';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NewPostModal from './new-post-modal.tsx';
import PostsTable from '../post_table.tsx';
import { URLS } from '../../../services/urls.ts';
import LoadingButton from '../../../components/loading_button/index.tsx';
import { getDateString } from '../../../services/utils.ts';
import DeleteDialog from './delete-dialog.tsx';
import ReindexFeedDialog from './reindex-feed.tsx';
import ReindexingDialog from '../obstractions/reindex.tsx';

const PostPage: React.FC = () => {
    const { feed_id } = useParams<{ feed_id: string }>(); // `id` corresponds to `:id` in the route
    const [feed, setFeed] = useState<Feed | null>({
        profile_id: '',
        polling_schedule_minute: 0,
        is_public: false,
        next_polling_time: '',
        obstract_feed_metadata: {},
    } as any)
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
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [showReindexDialog, setShowReindexDialog] = useState(false)
    const [showReindexProcessingDialog, setShowReindexProcessingDialog] = useState(false)
    const [reIndexJobId, setReIndexJobId] = useState('')


    const navigate = useNavigate()

    const loadFeed = async (feed_id: string) => {
        const res = await fetchObstractFeed(feed_id);
        setFeed(res.data);
    }

    const loadProfiles = async (pageNumber: number) => {
        const res = await fetchObstractProfiles(pageNumber);
        setProfiles(res.data.profiles);
    };

    useEffect(() => {
        loadProfiles(1)
    }, [])
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

    const profileChanged = (value) => {
        if (!feed) return
        setFeed({ ...feed, profile_id: value })
    }

    const updateFeed = async () => {
        if (!feed) return
        setLoadEditButton(true)
        await reloadObstractFeed(feed.id, feed.is_public, feed.polling_schedule_minute, feed.profile_id)
        setLoadEditButton(false)
        setDisableEdit(true)
    }
    const handleDelete = async () => {
        setOpenDeleteDialog(true);
    };

    const editFeed = () => {
        navigate(URLS.staffObstractFeedEdit(feed?.id || ''))
    }

    const onConfirmReIndex = (jobId: string) => {
        setReIndexJobId(jobId);
        setShowReindexProcessingDialog(true);
        setShowReindexDialog(false);
    }

    return (
        <Container>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography variant="h4" gutterBottom>
                        {feed?.obstract_feed_metadata.title}
                        <Button sx={{ marginLeft: '3rem', textTransform: 'uppercase' }} variant='contained' color="error" onClick={handleDelete}>Delete Feed</Button>
                        <Button sx={{ marginLeft: '3rem', textTransform: 'uppercase' }} variant='contained' color="success" onClick={() => navigate('add-post')}>Add Post</Button>
                        <Button variant='contained' sx={{ marginLeft: '2rem' }} onClick={() => setShowReindexDialog(true)}>Reindex feed</Button>
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
                    <TableRow>
                        <TableCell>Is public</TableCell>
                        <TableCell>{feed?.is_public ? 'True': 'False'}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Polling schedule (minutes)</TableCell>
                        <TableCell>{getDateString(feed?.next_polling_time)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Profile</TableCell>
                        <TableCell>{profiles?.find(profile => profile.id === feed?.profile_id)?.name}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Box sx={{ display: 'flex' }}>
                <Button onClick={editFeed} variant='contained'>Edit Feed</Button>
                <Box sx={{ marginLeft: '1rem' }}>
                    <Link to={URLS.staffObstractJobs(feed_id)}>
                        <Button variant='contained' sx={{ textTransform: 'uppercase' }}>Feed jobs</Button>
                    </Link>
                </Box>
            </Box>

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
            {feed &&
                <ReindexFeedDialog
                    onConfirmReIndex={onConfirmReIndex}
                    onClose={() => setShowReindexDialog(false)}
                    open={showReindexDialog}
                    feed={feed}
                ></ReindexFeedDialog>
            }
            <ReindexingDialog onClose={() => setShowReindexProcessingDialog(false)} open={showReindexProcessingDialog} jobId={reIndexJobId}></ReindexingDialog>
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
