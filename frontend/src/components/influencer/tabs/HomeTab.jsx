import React from 'react';
import CreatePost from '../../common/CreatePost/CreatePost';
import PostCard from "../../common/PostCard/PostCard";
import { EmptyState } from '../../common/LayoutBlocks';
import { Mailbox } from 'lucide-react';

export default function HomeTab({ feed = [], loadFeed, onViewProfile }) {
  return (
    <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
      <CreatePost onPostCreated={() => loadFeed()} />
      <div className="posts-feed" style={{ marginTop: '1rem' }}>
        {feed.length === 0 ? (
          <EmptyState 
            icon={Mailbox} 
            message="No posts yet." 
            description="Be the first to share an update with your community!"
          />
        ) : (
          feed.map((post, index) => (
            <PostCard
              key={post._id || `post-${index}`}
              post={post}
              onPostUpdated={loadFeed}
              onPostDeleted={loadFeed}
              onViewProfile={onViewProfile}
            />
          ))
        )}
      </div>
    </div>
  );
}
