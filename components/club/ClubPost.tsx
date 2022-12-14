import { DotsHorizontalIcon, HeartIcon, ChatIcon, PaperAirplaneIcon, BookmarkIcon, EmojiHappyIcon } from "@heroicons/react/outline";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import Moment from 'react-moment';

function ClubPost({
    id,
    clubId,
    username,
    userImg,
    img,
    title,
    caption, }: {
        id: any,
        username: string,
        userImg: string,
        clubId: string,
        img: string,
        caption: string,
        timestamp: any,
        title: string,
        scheduledTime: any,
    }) {

    const { data: session } = useSession();
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        const data = onSnapshot(
            query(collection(db, 'clubs',`${clubId}`,'activities', id, 'comments'), orderBy('timestamp', 'desc')),
            snapshot => {
                setComments(snapshot.docs);
            })

        return () => { data() }
    }, []);

    useEffect(() => {
        const data = onSnapshot(
            query(collection(db, 'clubs',`${clubId}`,'activities', id, 'likes'), orderBy('timestamp', 'desc')),
            snapshot => {
                setLikes(snapshot.docs);
            })
        return () => { data() }
    }, [db, id]);

    useEffect(() => {
        {/*@ts-ignore */}
        setHasLiked(likes.findIndex(like => like.id === session?.user?.uid) !== -1)
    }), [likes];

    const sendComment = async (e) => {
        e.preventDefault();

        const commentToSend = comment;
        setComment('');
        await addDoc(collection(db, 'clubs',`${clubId}`,'activities',id,"comments"), {
            comment: commentToSend,
            username: session.user.name,
            userImg: session.user.image,
            timestamp: serverTimestamp()
        })
        console.log('comment finish upload')
    }

    const likePost = async () => {

        if (hasLiked) {
            {/*@ts-ignore */}
            await deleteDoc(doc(db, 'clubs',`${clubId}`,'activities',id, 'likes', session.user.uid))
            console.log("unliked", id)
        } else {
            {/*@ts-ignore */}
            await setDoc(doc(db, 'clubs',`${clubId}`,'activities', id, 'likes', session.user.uid), {
                username: session.user.name
            });
            console.log('liked', id)
        }
    }

    return (
        <div className="bg-white my-7 border rounded-sm">
            {/* Header */}
            <div className="flex items-center p-5">
                <img src={userImg} alt={username} className="rounded-full h-12 w-12 object-contain border p-1 mr-3" />
                <p className="flex-1 font-bold">{username}</p>
                <p className="flex-1 font-bold">{title}</p>
                <DotsHorizontalIcon className="h-5" />
            </div>
            {/* Img */}
            <img src={img} alt="" className="object-cover w-full rounded-sm border" />
            {/* Buttons */}
            {session && (<div className="flex justify-between px-4 pt-4">
                <div className="flex space-x-4">
                    <HeartIcon
                        className="btnCus"
                        onClick={likePost}
                    />
                    <ChatIcon className="btnCus" />
                    <PaperAirplaneIcon className="btnCus" />
                </div>
                <BookmarkIcon className="btnCus" />
            </div>)}
            {/* Caption */}
            <p className="p-5 truncate">
                {caption}
            </p>
            {/* Comments */}
            {comments.length > 0 && (
                <div className="ml-10 h-20 overflow-y-scroll scrollbar-thin scrollbar-thumb-black">
                    {comments.map((value) => {
                        return <div className="mb-4 mt-4">
                            <p className="mb-1">
                                <span className="font-bold mr-1">{value.data().username}</span>
                                {value.data().comment}
                            </p>
                            <Moment fromNow className="pr-5 text-xs text-gray-400">
                                {value.data().timestamp?.toDate()}
                            </Moment>
                        </div>
                    })}
                </div>
            )}
            {/* Input Box */}
            {session && (<div className="flex items-center p-4 border-t">
                <EmojiHappyIcon className="h-7" />
                <form className="flex flex-1">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className="border-none flex-1 focus:ring-0 outline-none"
                        value={comment}
                        onChange={(e) => { setComment(e.target.value) }}
                    />
                    <button
                        type="submit"
                        disabled={!comment.trim()}
                        className="font-semibold text-blue-400"
                        onClick={sendComment}
                    >Post</button>
                </form>
            </div>)}
            {/* Likes */}
        </div>
    );
}

export default ClubPost;