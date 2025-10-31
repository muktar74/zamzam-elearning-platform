
import React, { useState } from 'react';
import { Course, DiscussionPost, User, Toast } from '../types';
import { UserCircleIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from './icons';
import { supabase } from '../services/supabaseClient';

interface DiscussionForumProps {
  courseId: string;
  posts: DiscussionPost[];
  currentUser: User;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  addToast: (message: string, type: Toast['type']) => void;
}

interface PostProps {
  post: DiscussionPost;
  onReply: (postId: string, text: string) => void;
  currentUser: User;
  isReply?: boolean;
}

const Post: React.FC<PostProps> = ({ post, onReply, currentUser, isReply = false }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(post.id, replyText);
        setReplyText('');
        setShowReplyBox(false);
    };

    return (
        <div className={`flex space-x-4 ${isReply ? 'mt-4' : ''}`}>
            <UserCircleIcon className="h-8 w-8 text-slate-400 flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <div className="bg-slate-50 rounded-lg p-3">
                    <p className="font-semibold text-slate-800 text-sm">{post.authorName}</p>
                    <p className="text-slate-700 text-sm">{post.text}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                    <button onClick={() => setShowReplyBox(!showReplyBox)} className="font-semibold hover:underline">Reply</button>
                </div>

                {showReplyBox && (
                    <form onSubmit={handleReplySubmit} className="mt-2 flex space-x-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full text-sm px-3 py-1 border border-slate-300 rounded-full focus:outline-none focus:ring-1 focus:ring-zamzam-teal-500 bg-white"
                        />
                        <button type="submit" className="bg-zamzam-teal-600 text-white p-2 rounded-full hover:bg-zamzam-teal-700 transition">
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {post.replies && post.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-slate-200">
                        {post.replies.map(reply => <Post key={reply.id} post={reply} onReply={onReply} currentUser={currentUser} isReply />)}
                    </div>
                )}
            </div>
        </div>
    )
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({ courseId, posts, currentUser, setCourses, addToast }) => {
  const [newPostText, setNewPostText] = useState('');

  const addReplyToPost = (posts: DiscussionPost[], parentId: string, newReply: DiscussionPost): DiscussionPost[] => {
    return posts.map(post => {
      if (post.id === parentId) {
        return { ...post, replies: [...post.replies, newReply] };
      }
      if (post.replies && post.replies.length > 0) {
        return { ...post, replies: addReplyToPost(post.replies, parentId, newReply) };
      }
      return post;
    });
  };

  const handleReply = async (parentId: string, text: string) => {
    const newReply: DiscussionPost = {
        id: `d-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        timestamp: new Date().toISOString(),
        text,
        replies: [],
    };

    const updatedDiscussion = addReplyToPost(posts, parentId, newReply);

    const { error } = await supabase
      .from('courses')
      .update({ discussion: updatedDiscussion })
      .eq('id', courseId);

    if (error) {
      addToast(`Error posting reply: ${error.message}`, 'error');
      return;
    }

    setCourses(prevCourses => prevCourses.map(course =>
        course.id === courseId
            ? { ...course, discussion: updatedDiscussion }
            : course
    ));
  };
  
  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: DiscussionPost = {
        id: `d-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        timestamp: new Date().toISOString(),
        text: newPostText,
        replies: [],
    };

    const updatedDiscussion = [newPost, ...posts];

    const { error } = await supabase
      .from('courses')
      .update({ discussion: updatedDiscussion })
      .eq('id', courseId);

    if (error) {
      addToast(`Error creating post: ${error.message}`, 'error');
      return;
    }

    setCourses(prevCourses => prevCourses.map(course =>
        course.id === courseId
            ? { ...course, discussion: updatedDiscussion }
            : course
    ));
    setNewPostText('');
  };


  return (
    <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Discussion Forum</h3>
        
        {/* New Post Form */}
        <div className="flex space-x-4 mb-8">
             <UserCircleIcon className="h-10 w-10 text-slate-400 flex-shrink-0" />
             <form onSubmit={handleNewPost} className="flex-grow flex items-center space-x-2">
                <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Start a new discussion..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                />
                <button type="submit" className="bg-zamzam-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition self-start">
                    Post
                </button>
             </form>
        </div>

        {/* Posts */}
        <div className="space-y-6">
            {posts.length > 0 ? (
                posts.map(post => <Post key={post.id} post={post} onReply={handleReply} currentUser={currentUser} />)
            ) : (
                <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-slate-400" />
                    <h4 className="text-lg font-semibold text-slate-700 mt-4">No Discussions Yet</h4>
                    <p className="text-slate-500 mt-1">Be the first to ask a question or share your thoughts!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default DiscussionForum;
