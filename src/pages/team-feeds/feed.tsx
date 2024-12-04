import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Container, List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Feed, fetchTeamObstractFeed, Post, unsubscribeTeamObstractFeeds, subscribeTeamObstractFeeds } from '../../services/obstract.ts';
import PostsTable from '../obstract/post_table.tsx';
import { TeamRouteContext } from '../team-layout.tsx/index.tsx';
import { TeamContext } from '../../contexts/team-context.tsx';
import { getDateString } from '../../services/utils.ts';

const TeamFeedPage: React.FC = () => {
    const { teamId } = useContext(TeamRouteContext)
    const { feedId } = useParams<{ teamId: string, feedId: string }>();
    const [feed, setFeed] = useState<Feed | null>()
    const { activeTeam } = useContext(TeamContext)
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const navigate = useNavigate()


    const loadFeed = async (teamId: string, feedId: string) => {
        const res = await fetchTeamObstractFeed(teamId, feedId);
        setFeed(res.data);
        loadPosts(res.data.obstract_feed_metadata['id'], 1)
    }


    const loadPosts = async (feed_id: string, pageNumber: number) => {
        // const res = await fetchObstractPosts(feed_id, pageNumber);
        // setPosts(res.data.posts);
        // setTotalPages(Math.ceil(res.data.page_results_count / res.data.page_size)); // Calculate total pages
    }

    const loadData = async (teamId: string, feedId: string) => {
        setLoading(true);
        await loadFeed(teamId, feedId)
        setLoading(false);
    };

    useEffect(() => {
        if (!feedId || !teamId) return;
        loadData(teamId, feedId);
    }, [feedId, teamId]);

    const unSubscribe = async () => {
        if (!teamId || !feedId) return
        await unsubscribeTeamObstractFeeds(teamId, feedId)
        return loadData(teamId, feedId)
    }

    const subscribe = async () => {
        if (!teamId || !feedId) return
        await subscribeTeamObstractFeeds(teamId, feedId)
        return loadData(teamId, feedId)
    }


    useEffect(() => {
        document.title = `${feed?.obstract_feed_metadata['title']} | Obstracts Web`
    }, [feed])

    return <Container>
        <Box>
            <Box sx={{ display: 'flex' }}>
                <Typography variant="h4" gutterBottom>
                    {feed?.obstract_feed_metadata.title}
                    {feed?.is_subscribed ? (
                        <Button disabled={!activeTeam?.has_active_subscription} onClick={() => unSubscribe()} sx={{ textTransform: 'uppercase', marginLeft: '3rem', }} variant='contained' color='error'>Unsubscribe</Button>
                    ) : (
                        <Button disabled={!activeTeam?.has_active_subscription} onClick={() => subscribe()} sx={{ textTransform: 'uppercase', marginLeft: '3rem', }} variant='contained'>Subscribe</Button>
                    )}
                </Typography>

            </Box><Box>
                <Typography>
                    {feed?.obstract_feed_metadata.description}
                </Typography>
            </Box>
            <Box>

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
                    <TableCell>Feed Type</TableCell>
                    <TableCell>{feed?.obstract_feed_metadata.feed_type}</TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>Pretty URL</TableCell>
                    <TableCell>{feed?.obstract_feed_metadata.pretty_url}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Next Update Date</TableCell>
                    <TableCell>{getDateString(feed?.next_polling_time)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>

        <Typography variant='h5'>Posts in this feed</Typography>
        {feed && <PostsTable disabled={!feed?.is_subscribed || !activeTeam?.has_active_subscription} teamId={teamId} feedId={feed?.obstract_feed_metadata['id']}></PostsTable>}
    </Container >

}

export default TeamFeedPage;