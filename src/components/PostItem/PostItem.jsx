import React, { useState, useEffect } from 'react'
import { db } from '../../firebaseConfig'
// import firebase from 'firebase/compat/app'
// import { AVATAR } from '../../ImageList'
import Avatar from "@mui/material/Avatar"
import "./Style-PostItem.css"
import { doc, setDoc, addDoc, collection, getDoc, getDocs, deleteDoc, orderBy, query, Timestamp } from 'firebase/firestore';
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@mui/material/Modal";
import { Button } from '@mui/material';

export default function PostItem(props) {

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [follower, setFollower] = useState("");
  const [followers, setFollowers] = useState([])
  const [author, setAuthor] = useState({})

  const [openModalFollowers, setOpenModalFollowers] = useState(false);

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const useStyles = makeStyles((theme) => ({
    paper: {
      position: "absolute",
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  const { data } = props

  const getDataAuthor = () => {
    var docRef = doc(db, "users", data.user_id)

    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setAuthor(docSnap.data())
      }
    })
  }

  const [state, setState] = useState(false) // state like post

  const getData = async () => {
    const postsCol = collection(db, `posts/${props.postId}/comments`)
    const snapshot = await getDocs(postsCol);

    setComments(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        cmt: doc.data(),
      }))
    );
  }

  const getDataFollowers = async () => {
    const postsCol = collection(db, `posts/${props.postId}/followers`)
    const snapshot = await getDocs(postsCol);

    //check if liked post
    var docRef = doc(db, `posts/${props.postId}/followers`, props.user.uid)

    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        // liked
        setState(true)
      }
    })

    snapshot.docs.map((res) => {
      var resRef = doc(db, "users", res.data().user_id)
      getDoc(resRef).then((resSnap) => {
        if (resSnap.exists()) {
          setFollowers(followers => [...followers, resSnap.data()])
        }
      })
    })
  }

  const submitComment = (e) => {
    // e.preventDefault();
    addDoc(collection(db, `posts/${props.postId}/comments`),
      {
        comment: comment,
        userName: props.user.displayName,
        timestamp: Timestamp.now()
      });
    setComment("");
  };

  useEffect(() => {
    if (props.postId) {
      getData();
      getDataFollowers();
      getDataAuthor();
    }
  }, [props.postId]);

  const handleLikePost = () => {
    // logic
    var docRef = doc(db, `posts/${props.postId}/followers`, props.user.uid)
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        // delete
        setState(false)
        deleteDoc(doc(db, `posts/${props.postId}/followers`, props.user.uid));
      }
      else {
        // add like
        setState(true)
        setFollower(props.user.uid)
        setDoc(doc(db, `posts/${props.postId}/followers`, props.user.uid),
          {
            user_id: props.user.uid,
            timestamp: Timestamp.now()
          });
      }
    })
  }

  const handleShowFollowers = () => {
    setOpenModalFollowers(true)
  }

  return (
    <div className="post__container">
      {/* Header -> username + avatar + local */}
      <div className="post__header">
        <div className="post__header--block-left">
          <div className="post__header--avatar">
            <Avatar alt="" src={author.avatarUrl} />
          </div>
        </div>
        <div className="post__header--username">
          <a href="#">{author.nickname}</a>
        </div>
        <div className="post__item--block-right">
          <div className="post__header--more-option">
            <span>
              <i className="bx bx-dots-horizontal-rounded"></i>
            </span>
          </div>
        </div>
      </div>
      {/* image  */}
      <div className="post__image">
        <img src={data.imageUrl} alt="p-1" />
      </div>

      <div className="post__group-bottom">
        {/* Group of interactive icons */}
        <div className="post__group-bottom">
          <div className="icons">
            <div className="icons-left">
              <span>
                <i className={`bx bx-heart ${state ? "btn-liked" : "btn-unliked"}`} onClick={handleLikePost}></i>
              </span>
              <span>
                <i className="bx bx-message-rounded"></i>
              </span>
              <span>
                <i className="bx bx-paper-plane"></i>
              </span>
            </div>
            <div className="icons-right">
              <span>
                <i className="bx bx-bookmark"></i>
              </span>
            </div>
          </div>
          <div className="post__interactive-info">
            <a href="/#">
              <span onClick={handleShowFollowers}>{followers.length} lượt thích</span>
            </a>
          </div>
        </div>
        {/* Username + Caption */}
        <div className="post__caption">
          <div className="post__caption--user">
            <span className="user-name">
              <a href="/#">{author.nickname}</a>
            </span>
            &nbsp;
            <span dangerouslySetInnerHTML={{ __html: data.caption }} className="caption"></span>
          </div>
          {/* Time */}
          <p className="post__caption--time"><span>1</span> Ngày trước</p>
        </div>

        {/* list comment */}
        <div className="post__comment--list">
          {comments.map(({ id, cmt }) => (
            <p key={id} className="post__comment--item">
              <a href='#' className="cmt_user-name">{cmt.userName}</a>
              <span className='comment'>
                {cmt.comment}
              </span>
            </p>
          ))}
        </div>
        {/* input field for comment */}
        <div className="post__comment">
          <form>
            <span>
              <i className='bx bx-smile'></i>
            </span>
            <input
              value={comment}
              type="text"
              placeholder="Thêm bình luận..."
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="btn btn-post-comment"
              type='submit'
              disabled={!comment}
              onClick={submitComment}
            >
              Đăng
            </button>
          </form>
        </div>
      </div>
      {/* react icon */}
      {/* username + caption */}
      {/* time */}
      {/* input comment */}

      {/* show followers */}
      <Modal open={openModalFollowers} onClose={() => setOpenModalFollowers(false)}>
        <div style={modalStyle} className={classes.paper}>
          {followers.map(( fl ) => (
              <div key={fl.id} className="follower-item">
                <Avatar alt="" src={fl.avatarUrl} />
                <a href='#' className="follower_user-name">{fl.nickname}</a>
                <Button className='btn-add-friend'>Add friend</Button>
                <hr />
              </div>
            ))}

        </div>
      </Modal>

    </div>
  )
}
