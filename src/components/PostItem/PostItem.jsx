import React, { useState, useEffect } from 'react'
import { db } from '../../firebaseConfig'
import Avatar from "@mui/material/Avatar"
import "./Style-PostItem.css"
import { onSnapshot, updateDoc, doc, setDoc, addDoc, 
        collection, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@mui/material/Modal";
import { Button, Menu, MenuItem, Input } from '@mui/material';

export default function PostItem(props) {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [follower, setFollower] = useState("");
  const [followers, setFollowers] = useState([])
  const [author, setAuthor] = useState({})

  const [openModalFollowers, setOpenModalFollowers] = useState(false);
  const [openModalChangeDesc, setOpenModalChangeDesc] = useState(false)

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

  const [caption, setCaption] = useState("")

  const [state, setState] = useState(false) // state like post

  useEffect(() => {
    setCaption(data.caption)
  }, [props.postId])

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

  // get post author
  useEffect(() => {
    if (props.postId) {
      let docRef = doc(db, "users", data.user_id)
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setAuthor(docSnap.data())
        }
      })
    }
  }, [props.postId]);

  // get followers
  useEffect(async () => {
    //check if liked post
    let docRef = doc(db, `posts/${props.postId}/followers`, props.user.uid)

    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        // liked
        setState(true)
      }
    })

    const unsub = onSnapshot(
      collection(db, `posts/${props.postId}/followers`),
      (snapshot) => {
        snapshot.docs.forEach((snapDoc) => {
          let resRef = doc(db, "users", snapDoc.data().user_id)
          getDoc(resRef).then((resSnap) => {
            if (resSnap.exists()) {
              setFollowers(followers => [...followers, resSnap.data()])
            }
          })
        })
        setFollowers(followers)
      },
      (error) => {
        console.log(error)
      }
    );
    return () => {
      unsub()
    }
  }, [props.postId])

  // get comment
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, `posts/${props.postId}/comments`),
      (snapshot) => {
        let commentList = [];
        snapshot.docs.forEach((doc) => {
          commentList.push({
            id: doc.id,
            cmt: doc.data()
          })
        })
        setComments(commentList)
      },
      (error) => {
        console.log(error)
      }
    );
    return () => {
      unsub()
    }
  }, [props.postId])

  const handleLikePost = () => {
    // logic
    let docRef = doc(db, `posts/${props.postId}/followers`, props.user.uid)
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        // delete
        setState(false)
        deleteDoc(doc(db, `posts/${props.postId}/followers`, props.user.uid));
      }
      else {
        // add like
        setState(true)
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
    console.log(data.timestamp.toDate().toDateString())
  }

  const handleClickDeletePost = () => {
    handleClose()
    if (window.confirm('Bạn có chắc muốn xoá bài viết này?')) {
      // OK
      handleDeletePost(props.postId)
    }
  }

  const handleDeletePost = (postId) => {
    deleteDoc(doc(db, "posts", postId));
    alert('Đã xoá bài viết!')
  }

  const handleClickChangeDesc = () => {
    handleClose();
    setOpenModalChangeDesc(true);
  }

  const handleChangeDesc = () => {
    updateDoc(doc(db, "posts", props.postId), {
      caption: caption
    })
    setOpenModalChangeDesc(false)
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
              <i
                className="bx bx-dots-horizontal-rounded"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              ></i>
              <Menu
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <MenuItem onClick={handleClickDeletePost}>Xoá</MenuItem>
                <MenuItem onClick={handleClickChangeDesc}>Chỉnh sửa mô tả</MenuItem>
                <MenuItem onClick={handleClose}>Chỉnh sửa quyền riêng tư</MenuItem>
              </Menu>
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
          <p className="post__caption--time"><span>{data.timestamp.toDate().toDateString()}</span></p>

        </div>

        {/* list comment */}
        <div className="post__comment--list">
          {comments.map(({ id, cmt }) => (
            <p key={id} className="post__comment--item">
              <a href='#' className="cmt_user-name">{cmt.userName}</a>
              <span className='comment'>
                {cmt.comment}
              </span>
              <p className="post__caption--time"><span>{cmt.timestamp.toDate().toDateString()}</span></p>

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
          {followers.map((fl) => (
            <div key={fl.id} className="follower-item">
              <Avatar alt="" src={fl.avatarUrl} />
              <a href='#' className="follower_user-name">{fl.nickname}</a>
              <Button className='btn-add-friend'>Add friend</Button>
              <hr />
            </div>
          ))}

        </div>
      </Modal>
      
      {/* Modal Change description */}
      <Modal open={openModalChangeDesc} onClose={() => setOpenModalChangeDesc(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="form__signup">
						<div className="form__group">
							<Input
								className="form__field"
								placeholder="Enter a caption"
								type="text"
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
							/>
						</div>
						<Button className="btn-signup" onClick={handleChangeDesc}>
							Change
						</Button>
					</form>
				</div>
			</Modal>
    </div>
  )
}

