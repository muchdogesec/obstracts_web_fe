import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Modal, Box } from '@mui/material';
import { fetchPostObjects, Post } from '../../../services/obstract.ts';

type PostCardProps = {
  post: Post;
  feed_id: string;
  onEdit: () => void;
};

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, feed_id }) => {
  const [openModal, setOpenModal] = useState(false);

  const loadData = async () => {
    await fetchPostObjects(feed_id, post.id)
  }

  // useEffect(() => { loadData() }, [])
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5">{post.title}</Typography>
          <Typography variant="caption">Published on: {new Date(post.pubdate).toLocaleString()}</Typography>
          <Button onClick={handleOpenModal}>View Details</Button>
          <Button onClick={onEdit}>Change profile</Button>
        </CardContent>
      </Card>

      {/* Modal to display the post description in HTML format */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h4" mb={2}>
            {post.title}
          </Typography>
          <Typography
            component="div"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />
          <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default PostCard;
