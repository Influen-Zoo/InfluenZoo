import React from 'react';
import { Search, Sparkles, Smartphone, UserCheck } from 'lucide-react';
import InfluencerCard from '../InfluencerCard';
import PostCard from '../../common/PostCard/PostCard';
import { resolveAssetUrl, getItemId } from '../../../utils/helpers';
import { SubTabNav, EmptyState } from '../../common/LayoutBlocks';

export default function ExploreTab({ 
  loadingItems, 
  items, 
  posts,
  exploreSubTab,
  setExploreSubTab,
  handleFollow,
  handleUnfollow,
  followingIds,
  onViewProfile
}) {
  const tabs = [
    { id: 'new', icon: Sparkles, label: 'New Influencer' },
    { id: 'all', icon: Smartphone, label: 'All Feed' },
    { id: 'followed', icon: UserCheck, label: 'Followed Influencer' },
  ];

  const searchPlaceholder = exploreSubTab === 'all' ? "Search feed..." : "Search influencers...";

  return (
    <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      <SubTabNav 
        tabs={tabs} 
        activeTab={exploreSubTab} 
        onChange={setExploreSubTab} 
      />

      <div className="top-search-wrapper" style={{ margin: '0 0 2rem 0', width: '100%' }}>
        <Search width={18} height={18} />
        <input type="text" placeholder={searchPlaceholder} />
      </div>

      {loadingItems ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" /></div>
      ) : exploreSubTab === 'all' ? (
        // Feed tab: show all posts
        posts && posts.length > 0 ? (
          <div className="feed-container responsive-feed responsive-stack">
            {posts.map(post => (
              <PostCard key={post._id} post={post} onViewProfile={onViewProfile} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Smartphone} 
            message="No posts found." 
            description="Be the first to see new content once it is posted."
          />
        )
      ) : items.length === 0 ? (
        <EmptyState 
          icon={exploreSubTab === 'followed' ? UserCheck : Sparkles} 
          message="No results found." 
          description="Try adjusting your filters or explore our community."
        />
      ) : (
        <div className="explore-results">
          {exploreSubTab === 'all' ? (
            <div className="feed-container responsive-feed responsive-stack">
              {items.map(post => (
                <PostCard key={post._id} post={post} onViewProfile={onViewProfile} />
              ))}
            </div>
          ) : (
            <div className="influencer-grid responsive-card-grid">
              {items.map((inf, idx) => {
                const infId = getItemId(inf);
                return (
                  <InfluencerCard 
                    key={infId || `inf-${idx}`}
                    influencer={inf}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    isFollowing={followingIds.includes(infId)}
                    onClick={() => onViewProfile(infId)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
